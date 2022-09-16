type SpacerProps = {
  size?: "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
};

const SpacerSizes = {
  "2xs": "0.5",
  xs: "1",
  sm: "2",
  md: "4",
  lg: "8",
  xl: "10",
  "2xl": "14",
  "3xl": "16",
};

const Spacer: React.FC<SpacerProps> = ({ size = "sm" }) => {
  return <div className={`p-${SpacerSizes[size]}`}></div>;
};

export default Spacer;
