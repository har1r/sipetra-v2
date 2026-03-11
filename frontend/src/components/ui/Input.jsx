import React from "react";

const Input = ({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = true,
}) => {
  return (
    <div className="relative group">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        // Shadow-inner memberikan efek kedalaman (sunk effect)
        className="w-full px-8 py-5 bg-givsum-input/60 border-none rounded-full 
        text-givsum-text font-bold text-sm placeholder:text-givsum-text/30
        focus:bg-white focus:ring-4 focus:ring-givsum-accent/5 
        transition-all duration-500 outline-none shadow-inner"
      />
      {/* Aksen titik kecil saat fokus */}
      <div className="absolute right-5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-givsum-accent rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
    </div>
  );
};

export default Input;
