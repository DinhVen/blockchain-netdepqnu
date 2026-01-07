const PageHeader = ({ title, subtitle, children }) => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-[#0F172A] dark:text-white mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[#64748B] max-w-2xl mx-auto">{subtitle}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default PageHeader;
