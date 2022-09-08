import {
  Facebook,
  Google,
  Discord,
  ReactJs,
  Twitter,
} from "@icons-pack/react-simple-icons";

type SimpleLogoProps = {
  name: string;
  title?: string;
  size?: number;
  color?: string;
};

const SimpleLogo: React.FC<SimpleLogoProps> = ({
  name,
  title,
  size,
  color,
}: SimpleLogoProps) => {
  switch (name) {
    case "facebook":
      return (
        <Facebook title={title ? title : name} size={size} color={color} />
      );
    case "google":
      return <Google title={title ? title : name} size={size} color={color} />;
    case "discord":
      return <Discord title={title ? title : name} size={size} color={color} />;
    case "twitter":
      return <Twitter title={title ? title : name} size={size} color={color} />;
    default:
      return <ReactJs />;
  }
};

export default SimpleLogo;
