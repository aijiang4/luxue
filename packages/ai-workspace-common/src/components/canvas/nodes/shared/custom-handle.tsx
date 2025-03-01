import { Handle, Position, HandleType } from '@xyflow/react';

interface CustomHandleProps {
  type: HandleType;
  position: Position;
  isConnected: boolean;
  isNodeHovered: boolean;
  nodeType: string;
}

export const CustomHandle = ({ type, position, isConnected, isNodeHovered }: CustomHandleProps) => {
  const baseHandleStyle = {
    width: position === Position.Left || position === Position.Right ? '12px' : '12px',
    height: position === Position.Left || position === Position.Right ? '12px' : '12px',
    background: '#fff',
    border: `2px solid ${isNodeHovered ? '#00968F' : '#D0D5DD'}`,
    minWidth: '12px',
    minHeight: '12px',
    borderRadius: '50%',
    opacity: isNodeHovered ? 1 : isConnected ? 0.8 : 0.4,
    cursor: 'crosshair',
    [position === Position.Left
      ? 'left'
      : position === Position.Right
        ? 'right'
        : position === Position.Top
          ? 'top'
          : 'bottom']: '-6px',
    transform:
      position === Position.Left || position === Position.Right
        ? 'translateY(-50%)'
        : 'translateX(-50%)',
    zIndex: 5,
    transition: 'all 0.2s ease',
  };

  return (
    <div
      className={`
        absolute ${position === Position.Left ? 'left-0' : 'right-0'} 
        ${position === Position.Left || position === Position.Right ? 'h-full' : 'w-full'}
        flex ${position === Position.Left || position === Position.Right ? 'items-center' : 'justify-center'}
        group
      `}
    >
      <div
        className={`absolute ${position === Position.Left || position === Position.Right ? 'top-1/2 -translate-y-1/2' : 'left-1/2 -translate-x-1/2'}`}
      >
        <Handle
          type={type}
          position={position}
          style={baseHandleStyle}
          isConnectable={true}
          className="hover:opacity-100 hover:border-[#00968F] hover:scale-110 transition-all"
        />
      </div>
    </div>
  );
};
