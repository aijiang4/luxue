import { Position, NodeProps, Node, useStore } from '@xyflow/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { CustomHandle } from './shared/custom-handle';
import { getNodeCommonStyles } from './index';
import { LuPencil, LuPencilLine } from 'react-icons/lu';
import { Button, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { CanvasNodeData, CanvasNode } from './shared/types';
import { IoColorPaletteOutline } from 'react-icons/io5';
import { LuEraser } from 'react-icons/lu';
import { TbZoomReset } from 'react-icons/tb';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { ActionButtons } from './shared/action-buttons';
import { usePatchNodeData } from '@refly-packages/ai-workspace-common/hooks/canvas/use-patch-node-data';
import { useAddNode } from '@refly-packages/ai-workspace-common/hooks/canvas/use-add-node';
import { useDeleteNode } from '@refly-packages/ai-workspace-common/hooks/canvas/use-delete-node';
import { nodeActionEmitter } from '@refly-packages/ai-workspace-common/events/nodeActions';
import { createNodeEventName } from '@refly-packages/ai-workspace-common/events/nodeActions';
import { cleanupNodeEvents } from '@refly-packages/ai-workspace-common/events/nodeActions';
import { genSkillID } from '@refly-packages/utils/id';
import { CanvasNodeType } from '@refly/openapi-schema';
import { TfiBlackboard } from 'react-icons/tfi';
import { createPortal } from 'react-dom';

interface Point {
  x: number;
  y: number;
}

interface PencilNodeData extends CanvasNodeData {
  content?: string;
  metadata?: {
    canvasContent?: string;
    imageFormat?: string;
    width?: number;
    height?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface PencilNodeProps extends NodeProps<Node<PencilNodeData>> {
  setNodeDraggable?: (draggable: boolean) => void;
  onDelete?: () => void;
}

export const PencilNode = ({ 
  id, 
  data, 
  selected, 
  dragging, 
  setNodeDraggable, 
  onDelete,
}: PencilNodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const [content, setContent] = useState(data.content || '');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const canvasContentRef = useRef<string | null>(null);
  const [strokeColor, setStrokeColor] = useState('#FFFFFF');
  const [lineWidth, setLineWidth] = useState(4.5);
  const [eraserSize, setEraserSize] = useState(20);
  const { t } = useTranslation();
  
  // 添加状态来跟踪黑板大小
  const [boardSize, setBoardSize] = useState({
    width: data.metadata?.width || 1200,
    height: data.metadata?.height || 800
  });
  
  // 添加状态来跟踪是否正在调整大小
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const initialSize = useRef({ width: 0, height: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // 添加状态来跟踪拉伸点的位置
  const [resizeHandlePosition, setResizeHandlePosition] = useState({ x: 0, y: 0 });
  
  // 添加状态来显示尺寸提示
  const [showSizeHint, setShowSizeHint] = useState(false);
  const [sizeHintPosition, setSizeHintPosition] = useState({ x: 0, y: 0 });
  
  // 获取画布缩放比例
  const zoom = useStore((state) => state.transform[2]);

  // 使用 usePatchNodeData hook
  const patchNodeData = usePatchNodeData();

  const { addNode } = useAddNode();
  const { deleteNode } = useDeleteNode();

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  useEffect(() => {
    if (setNodeDraggable) {
      setNodeDraggable(!isEditing && !isResizing);
    }
  }, [isEditing, isResizing, setNodeDraggable]);

  useEffect(() => {
    if (isEditing && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isEditing, strokeColor, lineWidth]);

  // 添加全局事件监听器以处理绘画过程中的拖动
  useEffect(() => {
    if (isDrawingRef.current) {
      const handleGlobalEvents = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
      };

      window.addEventListener('dragstart', handleGlobalEvents, { capture: true });
      window.addEventListener('mousedown', handleGlobalEvents, { capture: true });
      window.addEventListener('pointerdown', handleGlobalEvents, { capture: true });

      return () => {
        window.removeEventListener('dragstart', handleGlobalEvents, { capture: true });
        window.removeEventListener('mousedown', handleGlobalEvents, { capture: true });
        window.removeEventListener('pointerdown', handleGlobalEvents, { capture: true });
      };
    }
  }, [isDrawingRef.current]);

  // 初始化时从data中加载画布内容
  useEffect(() => {
    if (canvasRef.current && data.metadata?.canvasContent) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          // 设置画布尺寸
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = data.metadata.canvasContent;
      }
    }
  }, [data.metadata?.canvasContent]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布背景色为深绿色
    ctx.fillStyle = '#2D4F3C';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 添加一些细微的纹理效果
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    
    // 绘制木板纹理效果
    // 水平木纹
    for (let y = 30; y < canvas.height; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // 垂直木纹（更细、更淡）
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 0.5;
    for (let x = 40; x < canvas.width; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // 绘制一些随机的粉笔痕迹
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const length = Math.random() * 60 + 20;
      const angle = Math.random() * Math.PI * 2;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx.stroke();
    }
    
    // 设置线条样式
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    // 根据缩放比例调整坐标
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    return { x, y };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    
    const point = getCanvasPoint(e);
    if (!point) return;

    isDrawingRef.current = true;
    lastPointRef.current = point;

    // 捕获指针
    canvasRef.current.setPointerCapture(e.pointerId);

    // 绘制初始点
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      // 调整画布尺寸以匹配显示尺寸
      const canvas = canvasRef.current;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;
      
      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        // 重新设置画布样式
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }

      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const point = getCanvasPoint(e);
    if (!point) return;

    if (isEraser) {
      // 橡皮擦模式
      ctx.save();
      ctx.beginPath();
      ctx.arc(point.x, point.y, eraserSize/2, 0, Math.PI * 2);
      ctx.fillStyle = '#2D4F3C';
      ctx.fill();
      ctx.restore();
    } else {
      // 画笔模式
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (lastPointRef.current) {
        ctx.beginPath();
        ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    }

    lastPointRef.current = point;
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    isDrawingRef.current = false;
    canvasRef.current.releasePointerCapture(e.pointerId);
    
    // 保存画布内容到节点数据的metadata中,同时保存图片格式
    const canvas = canvasRef.current;
    const imageFormat = 'image/png';
    const canvasContent = canvas.toDataURL(imageFormat, 1.0);
    
    // 确保画布内容不为空
    if (!canvasContent) {
      console.warn('画布内容为空');
      return;
    }

    // 保存画布内容和元数据
    patchNodeData(id, { 
      metadata: { 
        canvasContent,
        imageFormat,
        width: canvas.width,
        height: canvas.height
      } 
    });

    // 更新本地引用以便后续使用
    canvasContentRef.current = canvasContent;
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除时保持深绿色背景
    ctx.fillStyle = '#2D4F3C';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 添加一些细微的纹理效果
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    
    // 绘制木板纹理效果
    // 水平木纹
    for (let y = 30; y < canvas.height; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // 垂直木纹（更细、更淡）
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 0.5;
    for (let x = 40; x < canvas.width; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // 绘制一些随机的粉笔痕迹
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const length = Math.random() * 60 + 20;
      const angle = Math.random() * Math.PI * 2;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx.stroke();
    }
    
    canvasContentRef.current = null;
    patchNodeData(id, { metadata: { canvasContent: undefined } });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setNodeDraggable?.(isEditing);
  };

  const handleAskAI = useCallback(async () => {
    // 检查画布内容是否存在
    if (!canvasRef.current) {
      console.warn('画布引用不存在');
      return;
    }
    
    // 获取当前画布内容
    const canvas = canvasRef.current;
    const imageFormat = 'image/png';
    const canvasContent = canvas.toDataURL(imageFormat, 1.0);
    
    if (!canvasContent) {
      console.warn('无法获取画布内容');
      return;
    }

    try {
      // 生成文件名
      const timestamp = new Date().getTime();
      const filename = `pencil-${timestamp}.png`;

      // 将 base64 转换为 Blob
      const base64Data = canvasContent.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }
      
      const byteArray = new Uint8Array(byteArrays);
      const imageBlob = new Blob([byteArray], { type: imageFormat });
      const imageFile = new File([imageBlob], filename, { type: imageFormat });

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
        throw new Error(result.errMsg || '保存图片失败');
      }

      const { url: imageUrl, storageKey } = result.data;

      // 构建技能节点
      addNode(
        {
          type: 'skill',
          data: {
            title: `问问AI: ${filename}`,
            entityId: genSkillID(),
            metadata: {
              contextItems: [
                {
                  type: 'image',
                  title: data.title || '画笔内容',
                  entityId: data.entityId,
                  metadata: {
                    imageUrl,
                    storageKey,
                    mimeType: imageFormat,
                    width: canvas.width,
                    height: canvas.height,
                    sizeMode: 'adaptive',
                    isDrawing: true
                  },
                },
              ],
              images: [imageUrl],
            },
          },
        },
        [{ type: 'pencil', entityId: data.entityId } as any],
        false,
        true
      );
    } catch (error) {
      console.error('保存图片失败:', error);
    }
  }, [data, addNode, canvasRef]);

  const handleDelete = useCallback(() => {
    deleteNode({
      id,
      type: 'pencil' as unknown as CanvasNodeType,
      data,
      position: { x: 0, y: 0 },
    } as CanvasNode);
  }, [id, data, deleteNode]);

  useEffect(() => {
    const handleNodeAskAI = () => handleAskAI();
    const handleNodeDelete = () => handleDelete();

    nodeActionEmitter.on(createNodeEventName(id, 'askAI'), handleNodeAskAI);
    nodeActionEmitter.on(createNodeEventName(id, 'delete'), handleNodeDelete);

    return () => {
      nodeActionEmitter.off(createNodeEventName(id, 'askAI'), handleNodeAskAI);
      nodeActionEmitter.off(createNodeEventName(id, 'delete'), handleNodeDelete);
      cleanupNodeEvents(id);
    };
  }, [id, handleAskAI, handleDelete]);

  // 创建一个独立的拉伸点组件，使用 Portal 渲染到 body 上
  const ResizeHandle = () => {
    if (!(selected || isHovered) || isEditing || !nodeRef.current) return null;
    
    return createPortal(
      <>
        <div 
          className="fixed w-[36px] h-[36px] cursor-se-resize z-[9999]"
          style={{
            left: `${resizeHandlePosition.x - 18}px`,
            top: `${resizeHandlePosition.y - 18}px`,
            background: 'rgba(139, 69, 19, 0.9)',
            borderRadius: '50%',
            border: '3px solid #F5F5DC',
            boxShadow: '0 0 10px rgba(0,0,0,0.7), 0 0 0 2px rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'fixed',
            pointerEvents: 'all',
            transform: 'translate3d(0,0,0)', // 强制硬件加速
            willChange: 'transform', // 优化性能
            touchAction: 'none', // 防止触摸事件干扰
            transition: 'transform 0.1s ease-out' // 添加平滑过渡效果
          }}
          onMouseDown={(e) => {
            // 阻止所有默认行为和事件冒泡
            e.stopPropagation();
            e.preventDefault();
            
            // 阻止事件冒泡到父元素
            if (e.nativeEvent) {
              e.nativeEvent.stopImmediatePropagation();
            }
            
            // 立即禁用节点拖动
            if (setNodeDraggable) {
              setNodeDraggable(false);
            }
            
            // 设置调整大小状态
            setIsResizing(true);
            resizeStartPos.current = { x: e.clientX, y: e.clientY };
            initialSize.current = { width: boardSize.width, height: boardSize.height };
            
            // 显示尺寸提示
            setShowSizeHint(true);
            setSizeHintPosition({
              x: e.clientX + 20,
              y: e.clientY - 40
            });
            
            // 创建一个全屏透明覆盖层来捕获所有鼠标事件
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.zIndex = '10000';
            overlay.style.cursor = 'se-resize';
            overlay.style.backgroundColor = 'rgba(0,0,0,0.01)'; // 几乎透明但可以捕获事件
            
            // 添加鼠标移动事件处理
            const handleMouseMove = (moveEvent: MouseEvent) => {
              moveEvent.preventDefault();
              moveEvent.stopPropagation();
              
              // 更新尺寸提示位置
              setSizeHintPosition({
                x: moveEvent.clientX + 20,
                y: moveEvent.clientY - 40
              });
              
              // 使用 requestAnimationFrame 优化性能
              requestAnimationFrame(() => {
                const deltaX = (moveEvent.clientX - resizeStartPos.current.x) / zoom;
                const deltaY = (moveEvent.clientY - resizeStartPos.current.y) / zoom;
                
                // 保持宽高比例约为 3:2
                const aspectRatio = 1.5; // 宽/高 = 1.5
                let newWidth = Math.max(800, initialSize.current.width + deltaX);
                let newHeight = Math.max(600, initialSize.current.height + deltaY);
                
                // 可选：根据拖动方向调整宽高比
                const dragAngle = Math.atan2(deltaY, deltaX);
                if (Math.abs(dragAngle) < Math.PI / 4 || Math.abs(dragAngle) > 3 * Math.PI / 4) {
                  // 主要水平拖动，调整高度以匹配宽度
                  newHeight = newWidth / aspectRatio;
                } else {
                  // 主要垂直拖动，调整宽度以匹配高度
                  newWidth = newHeight * aspectRatio;
                }
                
                setBoardSize({
                  width: newWidth,
                  height: newHeight
                });
                
                // 更新拉伸点位置
                if (nodeRef.current) {
                  const rect = nodeRef.current.getBoundingClientRect();
                  setResizeHandlePosition({
                    x: rect.right,
                    y: rect.bottom
                  });
                }
              });
            };
            
            // 添加鼠标释放事件处理
            const handleMouseUp = (upEvent: MouseEvent) => {
              upEvent.preventDefault();
              upEvent.stopPropagation();
              
              // 隐藏尺寸提示
              setShowSizeHint(false);
              
              // 移除覆盖层
              document.body.removeChild(overlay);
              
              // 设置调整大小状态为 false
              setIsResizing(false);
              
              // 保存新的尺寸到节点数据
              patchNodeData(id, { 
                metadata: { 
                  ...data.metadata,
                  width: boardSize.width,
                  height: boardSize.height
                } 
              });
              
              // 重新启用节点拖动
              if (setNodeDraggable) {
                setNodeDraggable(!isEditing);
              }
            };
            
            // 添加事件监听器到覆盖层
            overlay.addEventListener('mousemove', handleMouseMove, { passive: false });
            overlay.addEventListener('mouseup', handleMouseUp);
            
            // 将覆盖层添加到 body
            document.body.appendChild(overlay);
          }}
        >
          <div className="w-[14px] h-[14px] bg-[#F5F5DC] rounded-full flex items-center justify-center">
            <div className="w-[6px] h-[6px] bg-[#8B4513] rounded-full"></div>
          </div>
        </div>
        
        {/* 尺寸提示 */}
        {showSizeHint && (
          <div 
            className="fixed px-3 py-1 rounded-md z-[10001] text-white text-xs font-mono"
            style={{
              left: `${sizeHintPosition.x}px`,
              top: `${sizeHintPosition.y}px`,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              pointerEvents: 'none'
            }}
          >
            {Math.round(boardSize.width)} × {Math.round(boardSize.height)}
          </div>
        )}
      </>,
      document.body
    );
  };

  // 更新拉伸点位置
  useEffect(() => {
    if (nodeRef.current && (selected || isHovered) && !isEditing) {
      // 立即更新一次位置
      const updatePosition = () => {
        if (nodeRef.current) {
          const rect = nodeRef.current.getBoundingClientRect();
          setResizeHandlePosition({
            x: rect.right,
            y: rect.bottom
          });
        }
      };
      
      updatePosition();
      
      // 设置定时器持续更新位置，以防节点被移动
      const updateInterval = setInterval(updatePosition, 100); // 每100毫秒更新一次
      
      return () => clearInterval(updateInterval);
    }
  }, [selected, isHovered, isEditing, boardSize]);

  return (
    <div
      ref={nodeRef}
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        pointerEvents: 'auto',
        userSelect: 'none',
        touchAction: 'none',
        position: 'relative'
      }}
    >
      {/* 渲染拉伸点 */}
      <ResizeHandle />
      
      <div style={{
        position: 'absolute',
        bottom: '-120px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '800px',
        height: '220px',
        zIndex: -1
      }}>
        <div style={{
          width: '40px',
          height: '220px',
          backgroundColor: '#8B4513',
          position: 'absolute',
          left: '20%',
          transform: 'rotate(15deg)',
          transformOrigin: 'top',
          borderRadius: '8px',
          boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
          backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.1) 10px, transparent 10px)',
          backgroundSize: '4px 20px'
        }} />
        <div style={{
          width: '40px',
          height: '220px',
          backgroundColor: '#8B4513',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          borderRadius: '8px',
          boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
          backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.1) 10px, transparent 10px)',
          backgroundSize: '4px 20px'
        }} />
        <div style={{
          width: '40px',
          height: '220px',
          backgroundColor: '#8B4513',
          position: 'absolute',
          right: '20%',
          transform: 'rotate(-15deg)',
          transformOrigin: 'top',
          borderRadius: '8px',
          boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
          backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.1) 10px, transparent 10px)',
          backgroundSize: '4px 20px'
        }} />
        <div style={{
          width: '700px',
          height: '20px',
          backgroundColor: '#5D3A1A',
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }} />
      </div>

      <ActionButtons
        nodeId={id}
        type={"pencil" as unknown as CanvasNodeType}
        isNodeHovered={isHovered}
      />
      <div
        className={`
          relative
          ${getNodeCommonStyles({ selected, isHovered })}
        `}
        style={{
          width: `${boardSize.width}px`,
          minHeight: `${boardSize.height}px`,
          backgroundColor: '#e9a065',
          borderRadius: '20px',
          padding: '10px',
          position: 'relative',
          boxShadow: '0 0 15px rgba(0,0,0,0.2), inset 0 0 30px rgba(0,0,0,0.1)',
          border: '12px solid #8B4513',
          borderStyle: 'ridge',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23744c28\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E"), linear-gradient(45deg, rgba(139,69,19,0.05) 25%, transparent 25%, transparent 75%, rgba(139,69,19,0.05) 75%, rgba(139,69,19,0.05)), linear-gradient(45deg, rgba(139,69,19,0.05) 25%, transparent 25%, transparent 75%, rgba(139,69,19,0.05) 75%, rgba(139,69,19,0.05))',
          backgroundSize: '100px 100px, 40px 40px, 40px 40px',
          backgroundPosition: '0 0, 0 0, 20px 20px'
        }}
      >
        {/* 书架装饰元素 - 顶部 */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          left: '-40px',
          right: '-40px',
          height: '30px',
          background: 'linear-gradient(to bottom, #5D3A1A, #8B4513)',
          borderRadius: '10px 10px 0 0',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
          zIndex: -1
        }}></div>
        
        {/* 书架装饰元素 - 左侧 */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          left: '-40px',
          width: '30px',
          height: 'calc(100% + 60px)',
          background: 'linear-gradient(to right, #5D3A1A, #8B4513)',
          borderRadius: '10px 0 0 10px',
          boxShadow: '-2px 0 10px rgba(0,0,0,0.3)',
          zIndex: -1,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'30\' height=\'30\' viewBox=\'0 0 30 30\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M15 0v30M0 15h30\' stroke=\'%23744c28\' stroke-opacity=\'0.3\' stroke-width=\'1\'/%3E%3C/svg%3E")',
        }}></div>
        
        {/* 书架装饰元素 - 右侧 */}
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-40px',
          width: '30px',
          height: 'calc(100% + 60px)',
          background: 'linear-gradient(to left, #5D3A1A, #8B4513)',
          borderRadius: '0 10px 10px 0',
          boxShadow: '2px 0 10px rgba(0,0,0,0.3)',
          zIndex: -1,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'30\' height=\'30\' viewBox=\'0 0 30 30\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M15 0v30M0 15h30\' stroke=\'%23744c28\' stroke-opacity=\'0.3\' stroke-width=\'1\'/%3E%3C/svg%3E")',
        }}></div>
        
        {/* 书架装饰元素 - 底部 */}
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-40px',
          right: '-40px',
          height: '30px',
          background: 'linear-gradient(to top, #5D3A1A, #8B4513)',
          borderRadius: '0 0 10px 10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          zIndex: -1
        }}></div>
        
        {/* 书架装饰元素 - 书本 */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '50px',
          width: '60px',
          height: '15px',
          background: '#D22B2B',
          borderRadius: '2px 2px 0 0',
          boxShadow: '0 -2px 5px rgba(0,0,0,0.2)',
          zIndex: -1
        }}></div>
        
        <div style={{
          position: 'absolute',
          top: '-25px',
          left: '120px',
          width: '40px',
          height: '20px',
          background: '#1E3F66',
          borderRadius: '2px 2px 0 0',
          boxShadow: '0 -2px 5px rgba(0,0,0,0.2)',
          zIndex: -1
        }}></div>
        
        <div style={{
          position: 'absolute',
          top: '-18px',
          left: '170px',
          width: '70px',
          height: '13px',
          background: '#2E8B57',
          borderRadius: '2px 2px 0 0',
          boxShadow: '0 -2px 5px rgba(0,0,0,0.2)',
          zIndex: -1
        }}></div>
        
        <CustomHandle
          type="target"
          position={Position.Left}
          isConnected={false}
          isNodeHovered={isHovered}
          nodeType="pencil"
        />
        <CustomHandle
          type="source"
          position={Position.Right}
          isConnected={false}
          isNodeHovered={isHovered}
          nodeType="pencil"
        />

        <div className="flex flex-col gap-1 p-2 relative z-10">
          {/* 标题栏 */}
          <div 
            className="flex items-center justify-between mb-1" 
            style={{ 
              pointerEvents: 'auto',
              touchAction: 'none',
              backgroundColor: '#F5F5DC',
              borderRadius: '8px 8px 0 0',
              padding: '4px 8px',
              border: '1px solid #8B4513',
              borderBottom: '2px solid #8B4513',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-yellow-600 to-red-700 flex items-center justify-center">
                <TfiBlackboard className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-bold text-[#5D3A1A]" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                {data.title || t('canvas.nodeTypes.pencil', 'AI黑板')}
              </span>
            </div>
            {!isEditing && (
              <Button
                type="primary"
                size="small"
                onClick={handleEditToggle}
                style={{ 
                  height: '24px', 
                  padding: '0 8px', 
                  fontSize: '12px',
                  backgroundColor: '#4B7F52',
                  borderColor: '#4B7F52'
                }}
              >
                开始绘画
              </Button>
            )}
          </div>

          {/* 内容区域 - 黑板主体 */}
          <div 
            className="flex-1 relative"
            style={{ 
              pointerEvents: 'auto',
              touchAction: 'none',
              backgroundColor: '#2D4F3C',
              borderRadius: '8px',
              padding: '8px',
              boxSizing: 'border-box',
              zIndex: 9,
              border: '5px solid #5D3A1A',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 3px 6px rgba(0,0,0,0.2)',
              backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 2px, transparent 2px, transparent 4px)',
              marginTop: '2px',
              marginBottom: isEditing ? '2px' : '0',
              width: '100%',
              height: boardSize.height - 80 // 减去标题栏和其他元素的高度
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <canvas
              ref={canvasRef}
              width={boardSize.width - 50} // 减去内边距和边框
              height={boardSize.height - 120} // 减去标题栏、内边距和边框
              onPointerDown={isEditing ? startDrawing : undefined}
              onPointerMove={isEditing ? draw : undefined}
              onPointerUp={isEditing ? stopDrawing : undefined}
              onPointerOut={isEditing ? stopDrawing : undefined}
              className={`
                rounded bg-[#2D4F3C] w-full h-full
                ${isEditing ? 'cursor-crosshair' : ''}
              `}
              style={{ 
                touchAction: 'none',
                width: '100%',
                height: '100%',
                boxShadow: 'inset 0 0 60px rgba(0,0,0,0.3)',
                borderRadius: '4px'
              }}
            />
            {!isEditing && (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 cursor-pointer group"
                onClick={handleEditToggle}
              >
                {!data.metadata?.canvasContent ? (
                  <>
                    <LuPencil className="w-10 h-10 text-gray-300 group-hover:text-white transition-colors" />
                    <span className="text-base text-gray-300 group-hover:text-white transition-colors" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                      点击开始绘画...
                    </span>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 bg-black/20 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col items-center gap-2">
                      <LuPencilLine className="w-10 h-10 text-white" />
                      <span className="text-base text-white" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                        继续绘画...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* 工具栏 - 仅在编辑模式显示，放在黑板下方 */}
          {isEditing && (
            <div 
              className="flex items-center justify-between py-2 px-3 mt-1"
              style={{
                backgroundColor: '#F5F5DC',
                borderRadius: '0 0 8px 8px',
                border: '1px solid #8B4513',
                boxShadow: '0 2px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#8B4513] rounded-md overflow-hidden">
                  <button
                    className={`flex items-center justify-center h-7 px-3 ${!isEraser ? 'bg-[#4B7F52] text-white' : 'bg-[#F5F5DC] text-[#5D3A1A]'}`}
                    onClick={() => setIsEraser(false)}
                    style={{ transition: 'all 0.2s' }}
                  >
                    <LuPencil className="w-4 h-4 mr-1" />
                    <span className="text-xs">画笔</span>
                  </button>
                  <button
                    className={`flex items-center justify-center h-7 px-3 ${isEraser ? 'bg-[#4B7F52] text-white' : 'bg-[#F5F5DC] text-[#5D3A1A]'}`}
                    onClick={() => setIsEraser(true)}
                    style={{ transition: 'all 0.2s' }}
                  >
                    <LuEraser className="w-4 h-4 mr-1" />
                    <span className="text-xs">橡皮</span>
                  </button>
                </div>
                
                {!isEraser ? (
                  <div className="flex items-center gap-3">
                    <Tooltip title="选择颜色">
                      <div className="relative w-6 h-6 cursor-pointer border border-[#8B4513] rounded overflow-hidden">
                        <div 
                          className="absolute inset-0" 
                          style={{ backgroundColor: strokeColor }}
                        />
                        <input
                          type="color"
                          value={strokeColor}
                          onChange={(e) => setStrokeColor(e.target.value)}
                          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </Tooltip>
                    <Tooltip title="画笔粗细">
                      <div className="flex items-center gap-1">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="0.5"
                          value={lineWidth}
                          onChange={(e) => setLineWidth(Number(e.target.value))}
                          className="w-20 h-1"
                          style={{
                            background: `linear-gradient(to right, #5D3A1A ${lineWidth * 10}%, #D2B48C ${lineWidth * 10}%)`
                          }}
                        />
                      </div>
                    </Tooltip>
                  </div>
                ) : (
                  <Tooltip title="橡皮擦大小">
                    <div className="flex items-center gap-1">
                      <input
                        type="range"
                        min="10"
                        max="50"
                        value={eraserSize}
                        onChange={(e) => setEraserSize(Number(e.target.value))}
                        className="w-20 h-1"
                        style={{
                          background: `linear-gradient(to right, #5D3A1A ${eraserSize * 2}%, #D2B48C ${eraserSize * 2}%)`
                        }}
                      />
                    </div>
                  </Tooltip>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Tooltip title="清空画布">
                  <Button
                    type="default"
                    size="small"
                    icon={<TbZoomReset className="w-3 h-3 mr-1" />}
                    onClick={clearCanvas}
                    style={{ 
                      height: '28px', 
                      padding: '0 8px',
                      color: '#8B4513',
                      borderColor: '#8B4513',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    清空
                  </Button>
                </Tooltip>
                <Button
                  type="primary"
                  size="small"
                  onClick={handleEditToggle}
                  style={{ 
                    height: '28px', 
                    padding: '0 12px', 
                    fontSize: '13px',
                    backgroundColor: '#4B7F52',
                    borderColor: '#4B7F52'
                  }}
                >
                  完成绘画
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 