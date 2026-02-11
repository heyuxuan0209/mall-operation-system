/**
 * 因果关系流图组件
 * 使用 Sankey 图展示因果关系链
 */

'use client';

import { ResponsiveContainer, Sankey, Tooltip } from 'recharts';

interface CausalFlowChartProps {
  data: {
    nodes: Array<{ name: string }>;
    links: Array<{ source: number; target: number; value: number }>;
  };
}

export default function CausalFlowChart({ data }: CausalFlowChartProps) {
  return (
    <div className="border rounded-lg p-4 bg-white my-3">
      <h3 className="text-lg font-semibold mb-2">因果关系流</h3>
      <p className="text-sm text-gray-600 mb-4">
        从根本原因到最终症状的影响路径（箭头粗细代表影响强度）
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <Sankey
          data={data}
          node={{ fill: '#8884d8', stroke: '#fff' }}
          link={{ stroke: '#77c878', strokeOpacity: 0.5 }}
          nodePadding={50}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <Tooltip />
        </Sankey>
      </ResponsiveContainer>

      <div className="mt-4 text-sm text-gray-600">
        <p>💡 解读：箭头越粗，影响越大。优先解决上游根因，可产生连锁改善效果。</p>
      </div>
    </div>
  );
}
