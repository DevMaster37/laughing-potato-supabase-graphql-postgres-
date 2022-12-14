import {
  rand,
  randEmail,
  randFullName,
  randUser,
  randNumber,
  randBetweenDate,
  User,
} from '@ngneat/falso'

import { addDays, subDays } from 'date-fns'

import { Organization, Contact, Activity } from '@app/graphql'

import { createMockStore } from './mock-store'
import { DeepPartial } from './types'

interface OrganizationsStore extends DeepPartial<Organization> {
  id: string
}

interface ContactsStore extends Contact {
  id: string
}

export const organizationStore =
  createMockStore<OrganizationsStore>('organizations')
const contactsStore = createMockStore<ContactsStore>('contacts')

interface ActivitiesStore extends Activity {
  id: string
}

const activitiesStore = createMockStore<ActivitiesStore>('activities')

const mapContact = (user: User, type?: string): Contact => {
  const { id, firstName, lastName, email } = user
  return {
    id,
    firstName,
    lastName,
    fullName: [firstName, lastName].join(' '),
    email,
    status: rand(['new', 'active', 'inactive']),
    type: type || rand(['lead', 'customer']),
    createdAt: randBetweenDate({
      from: new Date('01/01/2020'),
      to: new Date(),
    }).toISOString(),
    updatedAt: randBetweenDate({
      from: new Date('01/01/2020'),
      to: new Date(),
    }).toISOString(),
  }
}

export const getUser = () => {
  return {
    id: randNumber().toString(),
    name: randFullName(),
    email: randEmail(),
    status: 'active',
  }
}

export const getCurrentUser = () => {
  return {
    id: '1',
    email: 'nicholas.manske@gmail.com',
    name: 'Nicholas Manske',
    avatar: 'https://res.cloudinary.com/verdiq-static/image/upload/q_47/v1641507193/Candidate_Photos/Nicholas_Manske_Headshot_Greece.jpg',
  }
}

export const getComment = (comment: string) => {
  const user = getCurrentUser()
  return {
    id: randNumber().toString(),
    user,
    type: 'comment',
    data: {
      comment,
    },
    date: new Date().toISOString(),
  } as Activity
}

export const getActivities = () => {
  const state = activitiesStore.getState()

  const activities = Object.values(state.data)

  if (!activities.length) {
    const user = getCurrentUser()
    ;[
      {
        id: '1',
        user,
        type: 'action',
        data: { action: 'created-contact' },
        date: subDays(new Date(), 1).toISOString(),
      },
      {
        id: '2',
        user,
        type: 'comment',
        data: {
          comment:
            'Just talked with the customer and they will upgrade to Pro.',
        },
        date: subDays(new Date(), 1).toISOString(),
      },
      {
        id: '3',
        user: {
          id: '2',
          name: 'Eelco Wiersma',
        },
        type: 'update',
        data: {
          field: 'status',
          value: 'active',
        },
        date: subDays(new Date(), 1).toISOString(),
      },
    ].forEach((activity) => {
      state.add(activity as Activity)
    })
  }

  return Object.values(state.data).sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })
}

export const addActivity = (activity: Activity) => {
  const state = activitiesStore.getState()

  state.add(activity)
}

export const deleteActivity = (id: Activity['id']) => {
  const state = activitiesStore.getState()

  state.remove(id)
}

export const getContact = (id?: string): Contact | undefined => {
  if (!id) {
    return mapContact(randUser())
  }

  const contacts = getContacts()
  return contacts.find((contact) => contact.id === id)
}

export const getContacts = (
  type?: string,
  { refresh = false } = {},
): Contact[] => {
  const state = contactsStore.getState()

  const contacts = Object.values(state.data)
  if (refresh || !contacts.length) {
    randUser({ length: 100 })
      .map((user) => mapContact(user))
      .forEach((contact) => {
        state.add(contact as Contact)
      })
  }

  let types: string[]
  switch (type) {
    case 'lead':
      types = ['lead']
      break
    case 'customer':
      types = ['customer']
      break
    default:
      types = ['lead', 'customer']
  }

  return Object.values(state.data).filter((contact) =>
    types.includes(contact.type as string),
  )
}

export const getOrganization = () => {
  return getOrganizations()[0]
}

export const getOrganizationMember = () => ({
  roles: ['member'],
  user: getUser(),
  organization: getOrganization(),
})

export const getOrganizations = () => {
  return [
    {
      id: '1',
      name: 'aiFlow',
      slug: 'ai-flow',
      email: 'hello@saas-ui.dev',
      logo: 'https://res.cloudinary.com/verdiq/image/upload/v1665713412/aiRecruit/aiFlow_Logo.jpg',
      subscription: {
        id: '1',
        plan: 'pro',
        status: 'trialing',
        startedAt: new Date('2022-01-01').toISOString(),
        trialEndsAt: addDays(new Date(), 14).toISOString(),
      },
    },

    {
      id: '2',
      name: 'Korn Ferry',
      slug: 'korn-ferry',
      email: 'info@acme-corp.com',
      logo: 'https://res.cloudinary.com/verdiq/image/upload/v1665632205/aiRecruit/korn_ferry_logo.png',
      subscription: {
        id: '2',
        plan: 'pro',
        status: 'trialing',
        startedAt: new Date().toISOString(),
        trialEndsAt: addDays(new Date(), 14).toISOString(),
      },
    },

    {
      id: '3',
      name: 'Hireflow',
      slug: 'hire-flow',
      logo: 'https://res.cloudinary.com/verdiq/image/upload/v1665632204/aiRecruit/hirewell_logo.jpg',
      subscription: {
        id: '3',
        plan: 'enterprise',
        status: 'canceled',
        startedAt: subDays(new Date(), 28).toISOString(),
        trialEndsAt: subDays(new Date(), 14).toISOString(),
      },
    },
  ]
}

export const getSubscription = (slug: string) => {
  return getOrganizations().find((org) => org.slug === slug)?.subscription
}
