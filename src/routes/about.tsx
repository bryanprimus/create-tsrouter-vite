import { createFileRoute } from '@tanstack/react-router'
import { Hello } from '@/components/hello'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <div className="p-2">
      <Hello name="About" />
    </div>
  )
}
