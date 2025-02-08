import { Fragment, useState } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const isAdmin = profile?.role === 'admin'

  const navigation = [
    { name: 'Events', href: '/events', current: false },
    ...(isAdmin ? [
      { name: 'Dashboard', href: '/admin/dashboard', current: false },
      { name: 'Manage Events', href: '/admin/events', current: false },
      { name: 'Users', href: '/admin/users', current: false },
    ] : [
      { name: 'My Events', href: '/my-events', current: false },
      { name: 'Leaderboard', href: '/leaderboard', current: false },
      { name: 'Certificates', href: '/certificates', current: false },
    ]),
  ]

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Disclosure as="nav" className="bg-white shadow-sm">
        {({ }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between items-center">
                <div className="flex items-center">
                  <div className="flex flex-shrink-0 items-center">
                    <Link to="/" className="text-xl font-bold text-indigo-600">
                      EventManager
                    </Link>
                  </div>

                  {/* Hamburger Menu for Small Screens */}
                  {/* <div className="sm:hidden">
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="inline-flex items-center p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {menuOpen ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </button>
                  </div> */}

                  {/* Navigation Links for Large Screens */}
                  <div className={`hidden sm:flex sm:space-x-8 ${menuOpen ? 'block' : 'hidden'}`}>
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          item.current
                            ? 'border-indigo-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                          'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Profile Menu */}
                <div className="flex items-center ml-auto space-x-4">
                  {/* Bars Icon Next to Profile */}
                  <div className="sm:hidden">
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="inline-flex items-center p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {menuOpen ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
                        </span>
                      </div>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleSignOut}
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block w-full text-left px-4 py-2 text-sm text-gray-700'
                              )}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className={`sm:hidden ${menuOpen ? 'block' : 'hidden'}`}>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    'block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </>
        )}
      </Disclosure>

      {/* Main Content */}
      <main className="py-10">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}