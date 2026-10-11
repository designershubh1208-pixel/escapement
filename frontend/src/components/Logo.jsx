import React from 'react';

const Logo = ({ className = "h-[22px] w-auto" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 100"
      className={className}
      aria-label="Escapement Logo"
    >
      <text
        x="10"
        y="80"
        fontFamily="'Bricolage Grotesque', sans-serif"
        fontSize="85"
        fontWeight="800"
        className="fill-paper transition-colors duration-300"
      >
        E
      </text>
      <text
        x="65"
        y="80"
        fontFamily="'Bricolage Grotesque', sans-serif"
        fontSize="85"
        fontWeight="800"
        className="fill-lime"
      >
        ₹
      </text>
    </svg>
  );
};

export default Logo;
