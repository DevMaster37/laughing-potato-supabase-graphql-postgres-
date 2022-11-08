import * as React from 'react'

import { Flex, FlexProps, Container } from '@chakra-ui/react'

import { AppShell, AppShellProps } from '@saas-ui/pro'
import { HotkeysListOptions } from '@saas-ui/react'
import { Auth, AuthProps } from '@saas-ui/auth'
import { useLocation } from '@saas-ui/router'

import { Hotkeys } from '@app/features/core/components/hotkeys'
import { Link } from '@app/features/core/components/link'
import { Logo } from '@app/features/core/components/logo'

import { AppSidebar } from '@app/features/core/components/sidebar'
import { SettingsSidebar } from '@app/features/settings/components/sidebar'

import { authType, authProviders, authPaths } from '@app/config/auth'
import { settingsHotkeys, fullscreenHotkeys } from '@app/config/hotkeys'

import { useInitApp } from '../hooks/use-init-app'

import { AppLoader } from '../components/app-loader'

import { PublicLayout } from './public-layout'
import { BillingProvider } from '@saas-ui/billing'

/**
 * Wrapper component for Authenticated pages.
 *
 * Loads the minimal required user data for the app and
 * renders authentication screens when the user isn't authenticated.
 */
export const Authenticated: React.FC<AuthProps> = ({ children, ...rest }) => {
  const location = useLocation()

  const { isInitializing, isAuthenticated, billing } = useInitApp()

  const { view, title } =
    authPaths[location?.pathname || '/login'] || authPaths['/login']

  // Rendering the auth screens here so they are rendered in place,
  // on the current route, without the need to redirect.
  if (!isInitializing && !isAuthenticated) {
    return (
      <AuthLayout>
        <Container>
          <Logo margin="0 auto" mb="12" />
          <Auth
            title={title}
            providers={authProviders}
            onError={(err) => console.error(err)}
            view={view}
            type={authType}
            signupLink={<Link href="/signup">Sign up</Link>}
            loginLink={<Link href="/login">Log in</Link>}
            {...rest}
          />
        </Container>
      </AuthLayout>
    )
  }

  return (
    <BillingProvider value={billing}>
      <AppLoader isLoading={isInitializing} />
      {!isInitializing && children}
    </BillingProvider>
  )
}

/**
 * Layout for authentication screens (login/signup/etc...)
 */
export const AuthLayout: React.FC<FlexProps> = ({ children, ...rest }) => {
  return (
    <Flex minH="100vh" align="center" justify="center" {...rest}>
      {children}
    </Flex>
  )
}

interface AuthenticatedLayoutProps extends AppShellProps {
  hotkeys?: HotkeysListOptions
}

/**
 * Base layout for authenticated pages.
 */
export const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
  hotkeys,
  sidebar,
  ...rest
}) => {
  return (
    <Authenticated>
      <Hotkeys hotkeys={hotkeys}>
        <AppShell sidebar={sidebar} {...rest}>
          {children}
        </AppShell>
      </Hotkeys>
    </Authenticated>
  )
}

/**
 * Default authenticated layout with sidebar.
 */
export const DefaultLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
  sidebar = <AppSidebar />,
  ...rest
}) => {
  return (
    <AuthenticatedLayout sidebar={sidebar} {...rest}>
      {children}
    </AuthenticatedLayout>
  )
}

/**
 * Layout for settings pages.
 */
export const SettingsLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
  hotkeys = settingsHotkeys,
  ...rest
}) => {
  return (
    <AuthenticatedLayout
      hotkeys={hotkeys}
      {...rest}
      sidebar={<SettingsSidebar />}
    >
      {children}
    </AuthenticatedLayout>
  )
}

/**
 * Fullscreen layout, for functionality that requires extra focus, like onboarding/checkout/etc.
 */
export const FullscreenLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
  hotkeys = fullscreenHotkeys,
  ...rest
}) => {
  return (
    <AuthenticatedLayout hotkeys={hotkeys} {...rest}>
      {children}
    </AuthenticatedLayout>
  )
}

interface AppLayoutProps {
  children: React.ReactNode
  /**
   * Array of paths that should render the public layout.
   */
  publicRoutes?: Array<string>
  /**
   * Render the public layout.
   */
  isPublic?: boolean
  /**
   * The layout to render.
   * Can be a component or build-in layout key `settings` | `fullscreen`
   */
  layout?: React.ReactNode
  /**
   * The sidebar component.
   */
  sidebar?: React.ReactNode
}

/**
 * Application layout
 * Handles rendering
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  publicRoutes = [],
  isPublic,
  layout,
  ...rest
}) => {
  const location = useLocation()
  const isPublicRoute =
    publicRoutes.indexOf(location.pathname) !== -1 || isPublic

  let LayoutComponent
  if (isPublicRoute) {
    LayoutComponent = PublicLayout
  } else if (typeof layout === 'function') {
    LayoutComponent = layout
  } else {
    switch (layout) {
      case 'settings':
        LayoutComponent = SettingsLayout
        break
      case 'fullscreen':
        LayoutComponent = FullscreenLayout
        break
      default:
        LayoutComponent = DefaultLayout
    }
  }

  return (
    <Flex
      position="absolute"
      w="100vw"
      h="100vh"
      fontSize="sm"
      flexDirection="column"
    >
      <LayoutComponent flex="1" minH="0" {...rest}>
        {children}
      </LayoutComponent>
    </Flex>
  )
}
