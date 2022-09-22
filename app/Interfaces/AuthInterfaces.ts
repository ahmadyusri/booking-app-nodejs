import { AuthContract } from '@ioc:Adonis/Addons/Auth'
import User from 'App/Models/User'

export interface AddUserProps {
  name: string
  email: string
  password: string
  locale?: string
}

export interface AddUserReturn {
  result: string
  title: string
  status_code: number
  data?: any
}

export interface LoginProps {
  email: string
  password: string
  locale?: string
}

export interface LoginReturn {
  result: string
  title: string
  status_code: number
  data?: any
}

export interface EventNewUserProps {
  user: User
  locale?: string
}

export interface CreateAPITokenProps {
  auth: AuthContract
  user: User
}

export interface LogoutProps {
  auth: AuthContract
}
