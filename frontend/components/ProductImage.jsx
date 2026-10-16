const FALLBACK_IMAGE = "/demo-product.svg";

export default function ProductImage({ src, alt, className }) {
  const handleError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = FALLBACK_IMAGE;
  };

  return (
    <img
      src={src || FALLBACK_IMAGE}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}
