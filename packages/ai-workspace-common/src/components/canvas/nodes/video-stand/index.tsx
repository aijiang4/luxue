import { Position, NodeProps, Node } from '@xyflow/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { CustomHandle } from '../shared/custom-handle';
import { getNodeCommonStyles } from '../index';
import { CanvasNodeData } from '../shared/types';
import { MdVideoCameraBack, MdCamera, MdZoomIn, MdZoomOut } from 'react-icons/md';
import { Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useAddNode } from '@refly-packages/ai-workspace-common/hooks/canvas/use-add-node';
import { useDeleteNode } from '@refly-packages/ai-workspace-common/hooks/canvas/use-delete-node';
import { usePatchNodeData } from '@refly-packages/ai-workspace-common/hooks/canvas/use-patch-node-data';
import { genSkillID } from '@refly-packages/utils/id';
import { CanvasNodeType } from '@refly/openapi-schema';
import { ActionButtons } from '../shared/action-buttons';
import { nodeActionEmitter } from '@refly-packages/ai-workspace-common/events/nodeActions';
import { createNodeEventName } from '@refly-packages/ai-workspace-common/events/nodeActions';
import { cleanupNodeEvents } from '@refly-packages/ai-workspace-common/events/nodeActions';

// 添加自定义事件类型，用于视频展台和AI提问节点之间的通信
export const VIDEO_STAND_EVENTS = {
  RESTORE_CAMERA: 'restoreCamera',
};

interface VideoStandMeta {
  videoUrl?: string;
  capturedImage?: string;
  [key: string]: unknown;
}

type VideoStandNode = Node<CanvasNodeData<VideoStandMeta>, 'videoStand'>;

export const VideoStandNode = ({ data, selected, id }: NodeProps<VideoStandNode>) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { addNode } = useAddNode();
  const { deleteNode } = useDeleteNode();
  const patchNodeData = usePatchNodeData();

  // 添加一个状态来跟踪是否应该在AI提问后自动恢复摄像头
  const [shouldRestoreCamera, setShouldRestoreCamera] = useState(false);
  const lastCapturedImageRef = useRef<string | null>(null);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 1280,
          height: 720
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('获取摄像头失败:', error);
      message.error(t('common.error.cameraAccessDenied'));
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return null;

    // 设置画布尺寸与视频相同
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // 在画布上绘制当前视频帧
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 将画布内容转换为base64图片数据
    const imageData = canvas.toDataURL('image/jpeg');
    
    try {
      // 生成文件名
      const timestamp = new Date().getTime();
      const filename = `capture-${timestamp}.jpg`;

      // 将 base64 转换为 Blob
      const base64Data = imageData.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }
      
      const byteArray = new Uint8Array(byteArrays);
      const imageBlob = new Blob([byteArray], { type: 'image/jpeg' });
      const imageFile = new File([imageBlob], filename, { type: 'image/jpeg' });

      // 调用上传 API
      const response = await fetch('/api/v1/misc/upload', {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          formData.append('file', imageFile);
          formData.append('entityType', 'canvas');
          return formData;
        })(),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.errMsg || t('common.error.imageSaveFailed'));
      }

      const { url: imageUrl, storageKey } = result.data;
      console.log('视频展台图片上传成功:', imageUrl); // 添加日志

      // 保存最后拍摄的图片URL，用于后续恢复摄像头时的判断
      lastCapturedImageRef.current = imageUrl;

      // 更新节点数据
      await patchNodeData(id, {
        metadata: {
          ...data.metadata,
          capturedImage: imageUrl,
          storageKey // 添加storageKey
        }
      });
      
      message.success(t('common.success.imageSaved'));
      // 停止视频流
      stopStream();
      
      // 设置标志，表示应该在AI提问后自动恢复摄像头
      setShouldRestoreCamera(true);
      
      return imageUrl;
    } catch (error) {
      console.error('保存图片失败:', error);
      message.error(t('common.error.imageSaveFailed'));
      return null;
    }
  };

  const handleAskAI = useCallback(async () => {
    try {
      let imageUrl = data.metadata?.capturedImage;
      console.log('开始AI提问，当前图片URL:', imageUrl);

      if (isStreaming) {
        // 如果正在预览，直接拍照
        console.log('正在预览状态，准备拍照');
        imageUrl = await captureImage();
        if (!imageUrl) {
          console.error('拍照失败，无法获取图片URL');
          message.error(t('common.error.imageSaveFailed'));
          return;
        }
        console.log('拍照成功，获取图片URL:', imageUrl);
      } else if (!imageUrl) {
        console.error('没有预览状态，且没有已拍摄的图片');
        message.error(t('canvas.videoStand.noCapturedImage'));
        return;
      }

      console.log('准备创建AI提问节点，使用图片:', imageUrl);
      
      // 获取视频/图片的尺寸
      let width = 1280;
      let height = 720;
      
      if (videoRef.current && isStreaming) {
        width = videoRef.current.videoWidth || width;
        height = videoRef.current.videoHeight || height;
      }
      
      // 构建技能节点
      const skillNodeId = genSkillID();
      
      // 创建一个临时的图片节点，用于AI提问
      const imageNodeId = genSkillID();
      
      // 首先添加图片节点
      addNode(
        {
          type: 'image',
          data: {
            title: `${data.title || t('canvas.nodeTypes.videoStand')} - 图片`,
            entityId: imageNodeId,
            metadata: {
              imageUrl,
              imageType: 'capture',
              storageKey: data.metadata?.storageKey,
              mimeType: 'image/jpeg',
              width,
              height,
            },
          },
        },
        [],
        true, // 隐藏节点
        false
      );
      
      // 然后添加AI提问节点，并连接到图片节点
      addNode(
        {
          type: 'skill',
          data: {
            title: `问问AI: ${data.title || t('canvas.nodeTypes.videoStand')}`,
            entityId: skillNodeId,
            metadata: {
              contextItems: [
                {
                  type: 'image',
                  title: `${data.title || t('canvas.nodeTypes.videoStand')} - 图片`,
                  entityId: imageNodeId,
                  metadata: {
                    imageUrl,
                    imageType: 'capture',
                    storageKey: data.metadata?.storageKey,
                  },
                },
              ],
              // 添加视频展台节点的ID，用于后续通信
              videoStandNodeId: id,
            },
          },
        },
        [
          { type: 'image', entityId: imageNodeId },
          { type: 'videoStand', entityId: data.entityId } as any
        ],
        false,
        true
      );
      
      console.log('AI提问节点创建成功，使用图片节点:', imageNodeId);
    } catch (error) {
      console.error('创建AI问答节点失败:', error);
      message.error(t('canvas.videoStand.createAINodeFailed'));
    }
  }, [data, addNode, isStreaming, t, captureImage, id]);

  // 添加一个函数来恢复摄像头
  const restoreCamera = useCallback(() => {
    if (!isStreaming && shouldRestoreCamera) {
      console.log('自动恢复摄像头');
      startStream();
      setShouldRestoreCamera(false);
    }
  }, [isStreaming, shouldRestoreCamera, startStream]);

  const handleDelete = useCallback(() => {
    deleteNode({
      id,
      type: 'videoStand' as unknown as CanvasNodeType,
      data,
      position: { x: 0, y: 0 },
    } as any);
  }, [id, data, deleteNode]);

  useEffect(() => {
    const handleNodeAskAI = () => handleAskAI();
    const handleNodeDelete = () => handleDelete();
    const handleRestoreCamera = () => restoreCamera();

    nodeActionEmitter.on(createNodeEventName(id, 'askAI'), handleNodeAskAI);
    nodeActionEmitter.on(createNodeEventName(id, 'delete'), handleNodeDelete);
    nodeActionEmitter.on(createNodeEventName(id, VIDEO_STAND_EVENTS.RESTORE_CAMERA), handleRestoreCamera);

    return () => {
      nodeActionEmitter.off(createNodeEventName(id, 'askAI'), handleNodeAskAI);
      nodeActionEmitter.off(createNodeEventName(id, 'delete'), handleNodeDelete);
      nodeActionEmitter.off(createNodeEventName(id, VIDEO_STAND_EVENTS.RESTORE_CAMERA), handleRestoreCamera);
      cleanupNodeEvents(id);
    };
  }, [id, handleAskAI, handleDelete, restoreCamera]);

  // 添加一个效果，当AI提问完成后自动恢复摄像头
  useEffect(() => {
    if (shouldRestoreCamera && !isStreaming && data.metadata?.capturedImage === lastCapturedImageRef.current) {
      // 设置一个短暂的延迟，确保AI提问节点已经创建完成
      const timer = setTimeout(() => {
        console.log('延迟后自动恢复摄像头');
        startStream();
        setShouldRestoreCamera(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [shouldRestoreCamera, isStreaming, data.metadata?.capturedImage, startStream]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ActionButtons
        nodeId={id}
        type={"videoStand" as unknown as CanvasNodeType}
        isNodeHovered={isHovered}
      />
      <div
        className={`
          w-[800px]
          min-h-[450px]
          ${getNodeCommonStyles({ selected, isHovered })}
          relative
          border-2 border-indigo-100
          shadow-md
        `}
      >
        <CustomHandle
          type="target"
          position={Position.Left}
          isConnected={false}
          isNodeHovered={isHovered}
          nodeType="videoStand"
        />
        <CustomHandle
          type="source"
          position={Position.Right}
          isConnected={false}
          isNodeHovered={isHovered}
          nodeType="videoStand"
        />

        <div className="flex flex-col gap-2 p-3">
          {/* 标题栏 - 使用学校风格的颜色和设计 */}
          <div className="flex items-center justify-between h-10 bg-indigo-50 rounded-t-lg px-3 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                <MdVideoCameraBack className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-indigo-800">
                {data.title || '智慧课堂 - 视频展台'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                type={isStreaming ? "default" : "primary"}
                size="small"
                className={`
                  ${isStreaming 
                    ? 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200' 
                    : 'bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700'}
                  transition-colors duration-300
                `}
                onClick={isStreaming ? stopStream : startStream}
              >
                {isStreaming ? '关闭摄像头' : '打开摄像头'}
              </Button>
              {isStreaming && (
                <Button
                  type="primary"
                  size="small"
                  className="bg-green-600 border-green-700 hover:bg-green-700 transition-colors duration-300"
                  icon={<MdCamera className="w-4 h-4" />}
                  onClick={captureImage}
                >
                  拍照
                </Button>
              )}
            </div>
          </div>

          {/* 视频区域 - 添加学校风格的边框和背景 */}
          <div className="bg-white rounded-lg flex items-center justify-center min-h-[400px] overflow-hidden border border-indigo-100 shadow-inner relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-contain ${!isStreaming && 'hidden'}`}
              style={{
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.3s ease-in-out'
              }}
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            {/* 添加缩放控制按钮 */}
            {isStreaming && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                <Button
                  type="default"
                  size="large"
                  className="flex items-center justify-center w-12 h-12 bg-[#F5EDE4] hover:bg-[#E8D5C4] border-2 border-[#B8865A] hover:border-[#8B4513] shadow-lg transition-all duration-300"
                  onClick={handleZoomIn}
                >
                  <div className="text-2xl font-bold text-[#8B4513]">+</div>
                </Button>
                <div className="h-[2px] bg-[#B8865A] opacity-50 rounded-full mx-1"></div>
                <div className="text-center text-[#8B4513] font-bold bg-[#F5EDE4] px-3 py-2 rounded-md border-2 border-[#B8865A] w-12">
                  {Math.round(zoomLevel * 100)}%
                </div>
                <div className="h-[2px] bg-[#B8865A] opacity-50 rounded-full mx-1"></div>
                <Button
                  type="default"
                  size="large"
                  className="flex items-center justify-center w-12 h-12 bg-[#F5EDE4] hover:bg-[#E8D5C4] border-2 border-[#B8865A] hover:border-[#8B4513] shadow-lg transition-all duration-300"
                  onClick={handleZoomOut}
                >
                  <div className="text-2xl font-bold text-[#8B4513]">−</div>
                </Button>
              </div>
            )}
            {!isStreaming && data.metadata?.capturedImage && (
              <div className="relative w-full h-full">
                <img 
                  src={data.metadata.capturedImage} 
                  alt="已拍摄的图片"
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-2 right-2 bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-xs">
                  已拍摄图片
                </div>
              </div>
            )}
            {!isStreaming && !data.metadata?.capturedImage && (
              <div className="text-indigo-500 text-center p-8 bg-indigo-50 rounded-lg">
                <MdVideoCameraBack className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
                <p className="text-indigo-700 font-medium">点击"打开摄像头"按钮开始课堂展示</p>
                <p className="text-indigo-500 text-sm mt-2">支持实时拍照和AI智能分析</p>
              </div>
            )}
          </div>
          
          {/* 添加底部信息栏 */}
          <div className="flex justify-between items-center mt-1 px-2 text-xs text-indigo-500">
            <span>智慧教学辅助工具</span>
            {isStreaming && (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                实时预览中
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 