import { createPage } from '@app/nextjs'

import { OverviewPage } from '@app/features/organizations'

export default createPage({
  title: 'Automations',
  renderComponent: () => {
    return <OverviewPage />
  },
})
