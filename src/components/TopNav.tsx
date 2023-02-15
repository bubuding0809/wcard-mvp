import SlideOver from "./SlideOver";
import { useState } from "react";

type TopNavProps = {
  title: string;
};

const TopNav: React.FC<TopNavProps> = ({ title }) => {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex z-10 p-4 pb-0">
      {/* Page information */}
      <h1 className="text-3xl font-bold text-center mr-auto ml-auto text-primary">
        {title}
      </h1>

      {/* Slide over menu */}
      <label className="absolute top-4 right-4 btn btn-circle btn-sm swap swap-rotate z-40 bg-transparent border-none text-neutral hover:text-white">
        <input
          className="hidden"
          type="checkbox"
          value="toggle"
          checked={open}
          onChange={() => setOpen(prevState => !prevState)}
        />

        <svg
          className="swap-off fill-current"
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 512 512"
        >
          <path d="M64,384H448V341.33H64Zm0-106.67H448V234.67H64ZM64,128v42.67H448V128Z" />
        </svg>

        <svg
          className="swap-on fill-current"
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 512 512"
        >
          <polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
        </svg>
      </label>
      <SlideOver open={open} setOpen={setOpen} />
    </header>
  );
};

export default TopNav;
