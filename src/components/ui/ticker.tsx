import React from 'react';

interface TickerProps {
  items: string[];
}

const OldSchoolTicker: React.FC<TickerProps> = ({ items }) => {
  return (
    <div className="crt-ticker">
      <div className="crt-ticker-content">
        {items.map((item, index) => (
          <span key={index} className="crt-ticker-item">{item}</span>
        ))}
        {/* Duplicate items to create a seamless loop */}
        {items.map((item, index) => (
          <span key={`dup-${index}`} className="crt-ticker-item">{item}</span>
        ))}
      </div>
    </div>
  );
};

export default OldSchoolTicker;