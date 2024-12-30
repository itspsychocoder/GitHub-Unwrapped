import React from "react";

const HeatmapLegend = () => {
  const legendData = [
    { value: 0, color: "#fff5e6" },
    { value: 1, color: "#ffcc80" },
    { value: 5, color: "#ff7f50" },
    { value: 10, color: "#ff5722" },
    { value: 20, color: "#e64a19" },
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
      
      <span className="text-sm text-gray-300">Less</span>
      {legendData.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div
            className="w-5 h-5 border-2 rounded"
            style={{ backgroundColor: item.color }}
          ></div>
        </div>
      ))}
      
      <span className="text-sm text-gray-300">More</span>
    </div>
  );
};

export default HeatmapLegend;
