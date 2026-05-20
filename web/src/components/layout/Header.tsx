import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { Menu, X, ChevronDown, Wallet, User, LogOut } from 'lucide-react';

// 控制是否启用用户登录注册功能
const ENABLE_AUTH = true;

interface NavChild {
  label: string;
  path: string;
  external?: boolean;
  description?: string;
}

interface NavItem {
  label: string;
  path?: string;
  hasDropdown: boolean;
  children?: NavChild[];
}

export const Header: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { wallet, fetchBalance } = useWalletStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 登录后获取钱包余额
  useEffect(() => {
    if (isAuthenticated) {
      fetchBalance();
    }
  }, [isAuthenticated, fetchBalance]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  const navItems: NavItem[] = [
    {
      label: 'Home',
      path: '/',
      hasDropdown: false,
    },
    {
      label: 'Tools',
      hasDropdown: true,
      children: [
        {
          label: 'Remove Watermark',
          path: '/remove-watermark',
          description: 'AI-powered watermark removal',
        },
        {
          label: 'Translate Image',
          path: '/translate-image',
          description: 'Translate text in images',
        },
      ],
    },
    {
      label: 'Pricing',
      path: '/pricing',
      hasDropdown: false,
    },
    {
      label: 'Blog',
      path: '/blog',
      hasDropdown: false,
    },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-sky-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">
              M
            </div>
            <span className="font-semibold text-gray-900 hidden sm:block">MDZZ</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item, index) => (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => item.hasDropdown && handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                {item.hasDropdown ? (
                  <button
                    className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center gap-1 transition-colors ${
                      activeDropdown === item.label
                        ? 'text-sky-600 bg-sky-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    aria-expanded={activeDropdown === item.label}
                    aria-haspopup="true"
                  >
                    {item.label}
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                  </button>
                ) : (
                  <Link
                    to={item.path || '/'}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActivePath(item.path || '')
                        ? 'text-sky-600 bg-sky-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                )}

                {/* Dropdown Menu */}
                {item.hasDropdown && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 pt-2 w-56 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                      {item.children?.map((child, childIndex) =>
                        child.external ? (
                          <a
                            key={childIndex}
                            href={child.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-2.5 hover:bg-gray-50 transition-colors"
                          >
                            <div className="text-sm font-medium text-gray-900">{child.label}</div>
                            {child.description && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {child.description}
                              </div>
                            )}
                          </a>
                        ) : (
                          <Link
                            key={childIndex}
                            to={child.path}
                            className="block px-4 py-2.5 hover:bg-gray-50 transition-colors"
                          >
                            <div className="text-sm font-medium text-gray-900">{child.label}</div>
                            {child.description && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {child.description}
                              </div>
                            )}
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {ENABLE_AUTH && (
              <>
                {isAuthenticated && user ? (
                  <div className="hidden md:flex items-center gap-3">
                    {/* Wallet Balance */}
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-sky-50 to-blue-50 rounded-lg border border-sky-100 hover:border-sky-200 transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-sky-600" />
                      <span className="text-sm font-semibold text-sky-600">
                        {wallet ? `$${wallet.balance}` : '...'}
                      </span>
                    </Link>

                    {/* User Menu */}
                    <div
                      className="relative"
                      onMouseEnter={() => handleMouseEnter('user')}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-sky-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </button>

                      {activeDropdown === 'user' && (
                        <div className="absolute top-full right-0 pt-2 w-48 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                            <div className="px-4 py-2 border-b border-gray-100">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {user.username}
                              </div>
                              <div className="text-xs text-gray-500 truncate">{user.email}</div>
                            </div>
                            <Link
                              to="/dashboard"
                              className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                            >
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">Dashboard</span>
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                            >
                              <LogOut className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">Logout</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <Link
                      to="/login"
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm"
                    >
                      Start for free
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <nav
          id="mobile-menu"
          className="md:hidden border-t border-gray-100 bg-white"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item, index) => (
              <div key={index}>
                {item.hasDropdown ? (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {item.label}
                    </div>
                    <div className="space-y-1">
                      {item.children?.map((child, childIndex) =>
                        child.external ? (
                          <a
                            key={childIndex}
                            href={child.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.label}
                          </a>
                        ) : (
                          <Link
                            key={childIndex}
                            to={child.path}
                            className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                              isActivePath(child.path)
                                ? 'text-sky-600 bg-sky-50'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ),
                      )}
                    </div>
                  </>
                ) : (
                  <Link
                    to={item.path || '/'}
                    className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActivePath(item.path || '')
                        ? 'text-sky-600 bg-sky-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            {ENABLE_AUTH && (
              <div className="pt-4 mt-4 border-t border-gray-100">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-sky-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        <div className="text-xs text-gray-500">
                          Balance: {wallet ? `$${wallet.balance}` : '...'}
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block w-full px-4 py-2.5 text-sm font-medium text-center text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full px-4 py-2.5 text-sm font-medium text-center text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Start for free
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};
