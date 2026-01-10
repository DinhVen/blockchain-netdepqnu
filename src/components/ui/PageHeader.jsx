const PageHeader = ({ title, subtitle, highlight, children }) => {
  // Split title if highlight is provided, otherwise use default
  const renderTitle = () => {
    if (highlight) {
      return (
        <>
          <span className="text-[#0F172A] dark:text-white">{title}</span>
          <span className="block text-[#2563EB]">{highlight}</span>
        </>
      );
    }
    return <span className="text-[#0F172A] dark:text-white">{title}</span>;
  };

  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl md:text-4xl font-black leading-tight mb-3">
        {renderTitle()}
      </h1>
      {subtitle && (
        <p className="text-[#64748B] dark:text-gray-400 max-w-2xl mx-auto text-lg">{subtitle}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default PageHeader;
