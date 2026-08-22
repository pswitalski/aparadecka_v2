import type {ReactNode} from 'react'

export const makeTextStyle = (fontSize: string) => {
  const Preview = ({children}: {children?: ReactNode}) => (
    <span style={{fontSize}}>{children}</span>
  )
  return Preview
}
