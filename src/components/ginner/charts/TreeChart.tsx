import React from 'react';
import { Tree as RD3Tree } from 'react-d3-tree';

interface TreeChartProps {
  data: any;
}

const renderForeignObjectNode = (props: any) => {
  const {
    nodeDatum
  } = props;
  const width = nodeDatum.width;
  const height = nodeDatum.height;
  const X = -(width / 2);
  const Y = -(height / 2);

  const Base = (props: any) => {
    const { children } = props;
    return <g>
      <foreignObject
        width={width}
        height={height}
        x={X}
        y={Y}
      >
        {children}
      </foreignObject>
    </g>
  }

  if (nodeDatum.type == "cotton_image") {
    return <Base>
      <p className="text-[13px] font-medium" style={{ marginTop: 8, marginBottom: 8, background: 'blue', padding: '6px', color: 'white', textAlign: 'center' }}>{nodeDatum.name}</p>
      <img src="/images/cotton.png" style={{ width: 50, height: 50, marginLeft: 75 }} />
    </Base>
  }

  if (nodeDatum.type == "village_image") {
    return <Base>
      <img src="/images/village.png" style={{ width, height }} />
    </Base>
  }

  return <Base>
    <div style={{ border: "1px solid black", background: '#fff' }}>
      {nodeDatum.list ?
        <ul style={{ padding: '10px' }}>
          <p className="text-[13px] font-normal">{nodeDatum.intro}</p>
          {nodeDatum.list.map((el: any) => {
            return <li key={el}>
              <p className="text-[12px] font-normal">&#8226; {el}</p>
            </li>
          })}
        </ul> :
        <div>
          <p className="text-[13px] font-medium" style={{ textAlign: 'center', padding: '6px' }}>{nodeDatum.name}</p>
        </div>
      }
    </div>
  </Base>
}

const TreeChart: React.FC<TreeChartProps> = ({ data }) => {
  const nodeSize = { x: 100, y: 40 };
  const foreignObjectProps = {};
  const straightPathFunc = (linkDatum: any, orientation: any) => {
    const { source, target } = linkDatum;
    console.log(source, target);
    return orientation === 'horizontal'
      ? `M${source.y},${source.x}L${target.y},${target.x}`
      : `M${source.x},${source.y + (source.data.height / 2 + 10)}L${target.x},${target.y - (target.data.height / 2 + 20)}`;
  };

  // Customizing the path connecting each node
  React.useEffect(() => {
    setTimeout(() => {
      var svg = document.getElementsByClassName('rd3t-svg');
      var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      // Create the marker element
      var marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', 'arrow');
      marker.setAttribute('markerWidth', '10');
      marker.setAttribute('markerHeight', '10');
      marker.setAttribute('refX', '0');
      marker.setAttribute('refY', '3');
      marker.setAttribute('orient', 'auto');
      marker.setAttribute('markerUnits', 'strokeWidth');

      // Create the arrow path
      var arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      arrowPath.setAttribute('d', 'M0,0 L0,6 L9,3 z');
      arrowPath.setAttribute('fill', '#000');

      // Append the arrow path to the marker
      marker.appendChild(arrowPath);

      // Append the marker to the defs
      defs.appendChild(marker);

      // Append the defs to the SVG
      svg[0].appendChild(defs);
      var paths = svg[0].querySelectorAll('path');
      for (var i = 0; i < paths.length; i++) {
        paths[i].setAttribute('marker-end', 'url(#arrow)');
      }
    }, 500);
  }, []);
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <RD3Tree
        data={data}
        orientation="vertical"
        pathFunc={straightPathFunc}
        renderCustomNodeElement={(rd3tProps) =>
          renderForeignObjectNode({ ...rd3tProps, foreignObjectProps })
        }
        translate={{
          x: 500,
          y: 100
        }}
      ></RD3Tree>
    </div>
  );
};

export default TreeChart;