import React from "react";

const HeatmapLegend = () => {
  const legendData = [
    { value: 0, color: "#0000ffff" },
    { value: 1, color: "#0000ffaa" },
    { value: 5, color: "#0000ff88" },
    { value: 10, color: "#0000ff55" },
    { value: 20, color: "#0000ff22" },
  ];
  // const legendData = [
  //   { value: 0, color: "#1a103d" },
  //   { value: 1, color: "#3b275e" },
  //   { value: 5, color: "#5c3e8b" },
  //   { value: 10, color: "#8b6bc3" },
  //   { value: 20, color: "#b8a3eb" },
  // ];

  return (
    <div className="flex items-center space-x-4 mt-4">
      {legendData.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div
            className="w-5 h-5 border-2 rounded"
            style={{ backgroundColor: item.color }}
          ></div>
          <span className="text-sm text-gray-300">{`${item.value}+`}</span>
        </div>
      ))}
    </div>
  );
};

export default HeatmapLegend;
