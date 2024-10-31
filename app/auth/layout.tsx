const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center relative">{children}</div>
  );
};

export default AuthLayout;
