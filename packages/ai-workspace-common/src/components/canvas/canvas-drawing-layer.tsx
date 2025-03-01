import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useStore, useReactFlow } from '@xyflow/react';
import { useCanvasStoreShallow, useCanvasStore } from '@refly-packages/ai-workspace-common/stores/canvas';

interface Point {
  x: number;
  y: number;
}

interface CanvasDrawingLayerProps {
  color: string;
  width: number;
  eraser: boolean;
  eraserSize: number;
}

export const CanvasDrawingLayer: React.FC<CanvasDrawingLayerProps> = ({
  color,
  width,
  eraser,
  eraserSize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  // 保存绘画内容的状态
  const canvasStateRef = useRef<ImageData | null>(null);
  
  // 获取画布缩放和平移信息
  const { transform } = useStore((state) => ({
    transform: state.transform,
  }));
  
  const zoom = transform[2];
  const translateX = transform[0];
  const translateY = transform[1];
  
  const { getViewport, screenToFlowPosition } = useReactFlow();
  
  const { 
    setDrawingColor, 
    setDrawingWidth, 
    setDrawingEraser, 
    setDrawingEraserSize 
  } = useCanvasStoreShallow((state) => ({
    setDrawingColor: state.setDrawingColor,
    setDrawingWidth: state.setDrawingWidth,
    setDrawingEraser: state.setDrawingEraser,
    setDrawingEraserSize: state.setDrawingEraserSize,
  }));

  // 将屏幕坐标转换为画布坐标
  const getCanvasPoint = (e: React.PointerEvent): Point => {
    if (!canvasRef.current || !containerRef.current) return { x: 0, y: 0 };
    
    const canvas = canvasRef.current;
    const rect = containerRef.current.getBoundingClientRect();
    
    // 使用clientX/Y而不是pageX/Y，避免滚动影响
    // 直接使用事件的offsetX和offsetY可能更准确
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    
    return { x, y };
  };

  // 创建粉笔效果
  const createChalkEffect = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    // 设置主要绘制样式
    ctx.globalAlpha = 0.9 + Math.random() * 0.1; // 略微随机的不透明度
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    
    // 绘制主要点
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 添加粉笔粉末效果 - 周围的小点
    const particleCount = Math.floor(size * 1.5);
    for (let i = 0; i < particleCount; i++) {
      const particleSize = Math.random() * size * 0.4;
      const distance = Math.random() * size * 0.8;
      const angle = Math.random() * Math.PI * 2;
      
      const particleX = x + Math.cos(angle) * distance;
      const particleY = y + Math.sin(angle) * distance;
      
      ctx.globalAlpha = Math.random() * 0.3;
      ctx.beginPath();
      ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 恢复默认透明度
    ctx.globalAlpha = 1;
  };

  // 开始绘制
  const startDrawing = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !ctxRef.current) return;
    
    // 防止事件冒泡，避免其他元素干扰
    e.stopPropagation();
    
    isDrawingRef.current = true;
    const point = getCanvasPoint(e);
    lastPointRef.current = point;
    
    const ctx = ctxRef.current;
    
    if (eraser) {
      // 橡皮擦模式
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(point.x, point.y, eraserSize / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 粉笔模式
      ctx.globalCompositeOperation = 'source-over';
      createChalkEffect(ctx, point.x, point.y, width, color);
    }
  };

  // 绘制
  const draw = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawingRef.current || !canvasRef.current || !ctxRef.current || !lastPointRef.current) return;
    
    // 防止事件冒泡，避免其他元素干扰
    e.stopPropagation();
    
    const point = getCanvasPoint(e);
    const ctx = ctxRef.current;
    
    if (eraser) {
      // 橡皮擦模式
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(point.x, point.y, eraserSize / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // 连接上一个点和当前点，确保擦除连续
      const distance = Math.sqrt(
        Math.pow(point.x - lastPointRef.current.x, 2) + 
        Math.pow(point.y - lastPointRef.current.y, 2)
      );
      
      if (distance > eraserSize / 4) {
        const steps = Math.floor(distance / (eraserSize / 4));
        for (let i = 1; i <= steps; i++) {
          const stepX = lastPointRef.current.x + (point.x - lastPointRef.current.x) * (i / steps);
          const stepY = lastPointRef.current.y + (point.y - lastPointRef.current.y) * (i / steps);
          ctx.beginPath();
          ctx.arc(stepX, stepY, eraserSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else {
      // 粉笔模式
      ctx.globalCompositeOperation = 'source-over';
      
      // 添加轻微的抖动效果，模拟粉笔的不稳定性
      const jitterAmount = width * 0.15;
      const jitteredPoint = {
        x: point.x + (Math.random() - 0.5) * jitterAmount,
        y: point.y + (Math.random() - 0.5) * jitterAmount
      };
      
      // 绘制粉笔效果
      createChalkEffect(ctx, jitteredPoint.x, jitteredPoint.y, width, color);
      
      // 连接上一个点和当前点，确保线条连续
      const distance = Math.sqrt(
        Math.pow(jitteredPoint.x - lastPointRef.current.x, 2) + 
        Math.pow(jitteredPoint.y - lastPointRef.current.y, 2)
      );
      
      if (distance > width / 3) {
        const steps = Math.floor(distance / (width / 3));
        for (let i = 1; i <= steps; i++) {
          const stepX = lastPointRef.current.x + (jitteredPoint.x - lastPointRef.current.x) * (i / steps);
          const stepY = lastPointRef.current.y + (jitteredPoint.y - lastPointRef.current.y) * (i / steps);
          
          // 添加更多的随机性
          const microJitter = {
            x: stepX + (Math.random() - 0.5) * jitterAmount * 0.5,
            y: stepY + (Math.random() - 0.5) * jitterAmount * 0.5
          };
          
          createChalkEffect(ctx, microJitter.x, microJitter.y, width * (0.8 + Math.random() * 0.4), color);
        }
      }
    }
    
    lastPointRef.current = point;
  };

  // 保存当前画布状态
  const saveCanvasState = useCallback(() => {
    if (!canvasRef.current || !ctxRef.current) return;
    
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    
    try {
      canvasStateRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (e) {
      console.error('保存画布状态失败:', e);
    }
  }, []);
  
  // 恢复画布状态
  const restoreCanvasState = useCallback(() => {
    if (!canvasRef.current || !ctxRef.current || !canvasStateRef.current) return;
    
    const ctx = ctxRef.current;
    try {
      ctx.putImageData(canvasStateRef.current, 0, 0);
    } catch (e) {
      console.error('恢复画布状态失败:', e);
    }
  }, []);

  // 停止绘制
  const stopDrawing = (e?: React.PointerEvent) => {
    if (e) {
      // 防止事件冒泡，避免其他元素干扰
      e.stopPropagation();
    }
    
    if (isDrawingRef.current) {
      // 保存当前画布状态
      saveCanvasState();
    }
    
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  // 清除画布
  const clearCanvas = () => {
    if (!canvasRef.current || !ctxRef.current) return;
    
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // 清除保存的状态
    canvasStateRef.current = null;
  };

  // 创建工具栏
  const renderToolbar = () => {
    return (
      <div 
        className="absolute bottom-4 right-4 flex flex-col gap-2 z-[99999]"
        style={{
          backgroundColor: '#F5F5DC',
          border: '3px solid #8B4513',
          boxShadow: '0 4px 20px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.7), 0 0 0 4px rgba(255,255,255,0.5)',
          borderRadius: '8px',
          padding: '12px',
          background: 'linear-gradient(to bottom, #F5F5DC, #E8D4B9)',
          maxWidth: '320px',
          overflow: 'visible',
          zIndex: 99999,
          position: 'fixed'
        }}
      >
        {/* 添加左上角标识 */}
        <div 
          style={{
            position: 'absolute',
            top: '-25px',
            left: '0',
            backgroundColor: '#B22222',
            color: 'white',
            padding: '3px 10px',
            borderRadius: '4px 4px 0 0',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 -2px 5px rgba(0,0,0,0.2)',
            whiteSpace: 'nowrap'
          }}
        >
          黑板工具栏
        </div>
        
        {/* 第一行：颜色选择器 */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-[#5D3A1A] font-bold whitespace-nowrap">粉笔颜色:</span>
          <div className="flex gap-1 flex-wrap">
            {['#FF0000', '#FFFFFF', '#FFFF00', '#00FF00', '#00FFFF', '#FFA500'].map((chalkColor) => (
              <div 
                key={chalkColor}
                className={`w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-110 ${color === chalkColor ? 'ring-2 ring-[#5D3A1A] ring-offset-1' : ''}`}
                style={{ 
                  backgroundColor: chalkColor,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  transform: color === chalkColor ? 'scale(1.1)' : 'scale(1)'
                }}
                onClick={() => setDrawingColor(chalkColor)}
              />
            ))}
          </div>
        </div>
        
        {/* 第二行：工具选择和粗细调整 */}
        <div className="flex items-center gap-2 mb-2">
          {/* 画笔/橡皮擦切换 */}
          <div className="flex items-center border border-[#8B4513] rounded-md overflow-hidden">
            <button
              className={`flex items-center justify-center h-7 px-3 ${!eraser ? 'bg-[#4B7F52] text-white' : 'bg-[#F5F5DC] text-[#5D3A1A]'}`}
              onClick={() => setDrawingEraser(false)}
              style={{ 
                transition: 'all 0.2s',
                boxShadow: !eraser ? 'inset 0 0 5px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              <span className="text-xs font-bold">粉笔</span>
            </button>
            <button
              className={`flex items-center justify-center h-7 px-3 ${eraser ? 'bg-[#4B7F52] text-white' : 'bg-[#F5F5DC] text-[#5D3A1A]'}`}
              onClick={() => setDrawingEraser(true)}
              style={{ 
                transition: 'all 0.2s',
                boxShadow: eraser ? 'inset 0 0 5px rgba(0,0,0,0.2)' : 'none'
              }}
            >
              <span className="text-xs font-bold">黑板擦</span>
            </button>
          </div>
          
          {/* 粗细调整 */}
          {!eraser ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5D3A1A] font-bold">粗细:</span>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={width}
                onChange={(e) => setDrawingWidth(Number(e.target.value))}
                className="w-20 h-1"
                style={{
                  background: `linear-gradient(to right, #5D3A1A ${width * 10}%, #D2B48C ${width * 10}%)`,
                  appearance: 'none',
                  borderRadius: '10px',
                  height: '4px'
                }}
              />
              <span className="text-xs text-[#5D3A1A] font-bold">{width.toFixed(1)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5D3A1A] font-bold">大小:</span>
              <input
                type="range"
                min="10"
                max="50"
                value={eraserSize}
                onChange={(e) => setDrawingEraserSize(Number(e.target.value))}
                className="w-20 h-1"
                style={{
                  background: `linear-gradient(to right, #5D3A1A ${eraserSize * 2}%, #D2B48C ${eraserSize * 2}%)`,
                  appearance: 'none',
                  borderRadius: '10px',
                  height: '4px'
                }}
              />
              <span className="text-xs text-[#5D3A1A] font-bold">{eraserSize}</span>
            </div>
          )}
        </div>
        
        {/* 第三行：操作按钮 */}
        <div className="flex items-center gap-2 justify-between">
          {/* 保存按钮 */}
          <button
            className="px-3 py-1 bg-[#4B7F52] text-white rounded text-xs hover:bg-[#3A6E41] transition-colors"
            onClick={() => {
              if (canvasRef.current) {
                // 创建临时链接并触发下载
                const link = document.createElement('a');
                link.download = `黑板内容_${new Date().toLocaleString().replace(/[\/\s:]/g, '_')}.png`;
                link.href = canvasRef.current.toDataURL('image/png');
                link.click();
              }
            }}
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.3)',
              fontWeight: 'bold'
            }}
          >
            保存图片
          </button>
          
          {/* 清除按钮 */}
          <button
            className="px-3 py-1 bg-[#8B4513] text-white rounded text-xs hover:bg-[#6B3513] transition-colors"
            onClick={clearCanvas}
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.3)',
              fontWeight: 'bold'
            }}
          >
            清除黑板
          </button>
          
          {/* 退出绘画按钮 */}
          <button
            className="px-3 py-1 bg-[#B22222] text-white rounded text-xs hover:bg-[#8B0000] transition-colors"
            onClick={() => {
              const setDrawingMode = useCanvasStore.getState().setDrawingMode;
              setDrawingMode(false);
            }}
            style={{
              boxShadow: '0 1px 3px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.3)',
              fontWeight: 'bold'
            }}
          >
            退出黑板
          </button>
        </div>
      </div>
    );
  };

  // 渲染黑板背景
  const renderBlackboardBackground = () => {
    return (
      <div 
        className="absolute top-0 left-0 w-full h-full"
        style={{
          backgroundColor: 'rgba(42, 98, 61, 0.15)', // 极低不透明度的背景
          backgroundImage: 'none', // 移除背景图案
          opacity: 0.4, // 极低的整体不透明度
          zIndex: -10,
          boxShadow: 'none', // 移除阴影
          border: '4px solid rgba(93, 64, 55, 0.2)', // 更细更透明的边框
          borderRadius: '4px',
          pointerEvents: 'none'
        }}
      >
        {/* 移除所有装饰元素，只保留最基本的边框 */}
      </div>
    );
  };

  // 调整画布大小以匹配视口
  const updateCanvasSize = useCallback(() => {
    if (containerRef.current && canvasRef.current) {
      // 保存当前状态
      const prevState = canvasStateRef.current;
      
      const { width, height } = containerRef.current.getBoundingClientRect();
      
      // 设置canvas元素的宽高属性（不是样式）
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      
      setCanvasSize({ width, height });
      
      // 重新初始化上下文，因为改变canvas大小会重置上下文
      if (ctxRef.current) {
        const ctx = ctxRef.current;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = color;
        ctx.shadowBlur = 1;
        ctx.globalAlpha = 0.85;
        
        // 如果有之前的状态，尝试恢复
        if (prevState) {
          try {
            // 只有当尺寸相同时才能直接恢复
            if (prevState.width === width && prevState.height === height) {
              ctx.putImageData(prevState, 0, 0);
            }
          } catch (e) {
            console.error('调整大小后恢复画布状态失败:', e);
          }
        }
      }
    }
  }, [color]);

  // 添加防抖处理，避免频繁更新
  useEffect(() => {
    updateCanvasSize();
    
    // 使用ResizeObserver监听容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // 监听窗口大小变化和左侧菜单栏变化
    window.addEventListener('resize', updateCanvasSize);
    
    // 尝试监听可能的菜单栏变化事件
    document.addEventListener('transitionend', updateCanvasSize);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateCanvasSize);
      document.removeEventListener('transitionend', updateCanvasSize);
    };
  }, [updateCanvasSize]);

  // 添加全局点击事件监听，防止点击其他组件时清除绘画
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // 如果点击的是画布容器内的元素，不做任何处理
      if (containerRef.current?.contains(e.target as Node)) {
        return;
      }
      
      // 如果点击的是其他元素，阻止事件传播到可能会清除画布的处理器
      e.stopPropagation();
    };
    
    // 捕获阶段监听点击事件，确保我们能在其他处理器之前处理
    document.addEventListener('click', handleGlobalClick, true);
    document.addEventListener('pointerdown', handleGlobalClick, true);
    
    return () => {
      document.removeEventListener('click', handleGlobalClick, true);
      document.removeEventListener('pointerdown', handleGlobalClick, true);
    };
  }, []);

  // 初始化画布
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { alpha: true });
    
    if (context) {
      ctxRef.current = context;
      
      // 设置画布样式
      context.lineCap = 'round';
      context.lineJoin = 'round';
      
      // 设置粉笔效果
      context.shadowColor = color;
      context.shadowBlur = 1;
      context.globalAlpha = 0.85; // 降低全局不透明度
      
      updateCanvasSize();
      
      // 尝试恢复之前的画布状态
      if (canvasStateRef.current) {
        try {
          context.putImageData(canvasStateRef.current, 0, 0);
        } catch (e) {
          console.error('初始化时恢复画布状态失败:', e);
        }
      }
    }
  }, [color, updateCanvasSize]);

  return (
    <div 
      ref={containerRef} 
      className="absolute top-0 left-0 w-full h-full" 
      style={{ 
        touchAction: 'none',
        pointerEvents: 'all',
        zIndex: 1,
        backgroundColor: 'transparent'
      }}
      onPointerDown={(e) => {
        // 阻止事件冒泡
        e.stopPropagation();
        startDrawing(e);
      }}
      onPointerMove={(e) => {
        // 阻止事件冒泡
        e.stopPropagation();
        draw(e);
      }}
      onPointerUp={(e) => {
        // 阻止事件冒泡
        e.stopPropagation();
        stopDrawing(e);
      }}
      onPointerLeave={(e) => {
        // 阻止事件冒泡
        e.stopPropagation();
        stopDrawing(e);
      }}
      // 阻止默认行为，防止选择文本等操作
      onContextMenu={(e) => e.preventDefault()}
    >
      {renderBlackboardBackground()}
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="absolute top-0 left-0 w-full h-full"
        style={{
          touchAction: 'none',
          zIndex: 2,
          backgroundColor: 'transparent'
        }}
      />
      {renderToolbar()}
    </div>
  );
}; 