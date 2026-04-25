import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import LanguageSelector from './LanguageSelector';

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-700/50 bg-slate-900/50 flex items-center justify-end px-6 sticky top-0 z-40 backdrop-blur-md">
          <LanguageSelector onSelect={(code) => console.log('Language changed to', code)} />
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
