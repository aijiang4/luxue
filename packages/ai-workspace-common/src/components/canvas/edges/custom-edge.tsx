import { memo, useState, useCallback } from 'react';
import { BaseEdge, EdgeProps, getBezierPath, useReactFlow, Position } from '@xyflow/react';
import { IconDelete } from '@refly-packages/ai-workspace-common/components/common/icon';
import { Input } from 'antd';

const { TextArea } = Input;
interface CustomEdgeData {
  label?: string;
}

const DeleteButton = ({ handleDelete }: { handleDelete: (e: React.MouseEvent) => void }) => {
  return (
    <div
      className="flex items-center justify-center w-5 h-5 rounded-full bg-white border border-gray-200 cursor-pointer hover:bg-gray-50"
      onClick={handleDelete}
    >
      <IconDelete className="w-3 h-3 text-red-500" />
    </div>
  );
};

export const CustomEdge = memo(
  ({ sourceX, sourceY, targetX, targetY, style, selected, data, id }: EdgeProps) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      curvature: 0.35,
    });

    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState((data as CustomEdgeData)?.label ?? '');
    const reactFlowInstance = useReactFlow();
    const { setEdges } = reactFlowInstance;
    const handleLabelClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditing(true);
    }, []);

    const handleLabelChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLabel(e.target.value);
    }, []);

    const updateEdgeData = useCallback((edgeId: string, data: Record<string, unknown>) => {
      setEdges((eds) => {
        const updatedEdges = eds.map((edge) => {
          if (edge.id === edgeId) {
            return { ...edge, data: { ...edge.data, ...data } };
          }
          return edge;
        });
        return updatedEdges;
      });
    }, []);

    const handleLabelBlur = useCallback(() => {
      setIsEditing(false);
      if (id) {
        updateEdgeData(id, { label });
      }
    }, [id, label, updateEdgeData]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          setIsEditing(false);
          if (id) {
            updateEdgeData(id, { label });
          }
        }
      },
      [id, label, updateEdgeData],
    );

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (id) {
        setEdges((eds) => eds.filter((e) => e.id !== id));
      }
    };

    return (
      <>
        <BaseEdge path={edgePath} style={style} />

        <foreignObject
          width={150}
          height={80}
          x={labelX - 75}
          y={labelY - 40}
          className="edge-label"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <div className="w-full h-full overflow-y-scroll" onClick={handleLabelClick}>
            {isEditing ? (
              <TextArea
                value={label}
                onChange={handleLabelChange}
                onBlur={handleLabelBlur}
                onKeyDown={handleKeyDown}
                className="nowheel text-[10px] w-full h-full bg-white resize-none overflow-y-scroll"
                autoFocus
                autoSize={{ minRows: 1, maxRows: 4 }}
              />
            ) : (
              label && (
                <div className="nowheel px-2 py-1 text-[10px] text-center text-gray-700 bg-opacity-0 rounded cursor-pointer break-all">
                  {label}
                </div>
              )
            )}
          </div>
        </foreignObject>

        {selected && (
          <foreignObject
            width={20}
            height={20}
            x={targetX - 20}
            y={targetY - 20}
            className="edge-delete-button"
            requiredExtensions="http://www.w3.org/1999/xhtml"
          >
            <DeleteButton handleDelete={handleDelete} />
          </foreignObject>
        )}
      </>
    );
  },
);
