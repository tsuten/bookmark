import React from 'react';

export const InputWithIcon = ({ icon, placeholder, value, onChange }) => {
  return (
    <div className="flex flex-row gap-2 items-center">
      <div class="mt-2">
    <div className="flex items-center bg-gray-100 pl-3 has-[input:focus-within]:outline-1 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-gray-500">
      {icon}
      <input id="price" type="text" name="price" placeholder="0.00" className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6" />
      <div className="grid shrink-0 grid-cols-1 focus-within:relative">
        {/* <select id="currency" name="currency" aria-label="Currency" className="col-start-1 row-start-1 w-full appearance-none rounded-md py-1.5 pr-7 pl-3 text-base text-gray-500 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
          <option>USD</option>
          <option>CAD</option>
          <option>EUR</option>
        </select> */}
      </div>
    </div>
  </div>
    </div>
  );
};