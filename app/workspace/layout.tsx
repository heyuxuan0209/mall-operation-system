// Workspace 独立全屏布局，不继承任何旧版导航
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-[#f8fafc]">
      {children}
    </div>
  );
}
