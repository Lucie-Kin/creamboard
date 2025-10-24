import TrafficLightIndicator from '../TrafficLightIndicator'

export default function TrafficLightIndicatorExample() {
  return (
    <div className="flex gap-8 p-8 bg-background">
      <TrafficLightIndicator status="green" label="All Good" />
      <TrafficLightIndicator status="yellow" label="Warning" />
      <TrafficLightIndicator status="red" label="Critical" pulse />
    </div>
  )
}
