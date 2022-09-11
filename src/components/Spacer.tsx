const Spacer: React.FC<{ size?: number }> = ({ size = 8 }) => {
  return <div className={`p-${size}`}></div>;
};

export default Spacer;
