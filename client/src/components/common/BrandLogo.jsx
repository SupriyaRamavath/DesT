function BrandLogo({ className = "", variant = "default" }) {
  return (
    <img
      className={`brand-logo-image ${className}`.trim()}
      src={variant === "sidebar" ? "/dest-logo-sidebar.svg" : "/dest-logo.svg"}
      alt="DesT"
    />
  );
}

export default BrandLogo;
