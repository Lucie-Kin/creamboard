import ProductionGrid from '../ProductionGrid';

export default function ProductionGridExample() {
  // Mock batch data
  const mockBatches = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      id: `batch-${i}`,
      batchNumber: `MK${1000 + i}`,
      productName: i % 3 === 0 ? 'Vanilla' : i % 3 === 1 ? 'Chocolate' : 'Strawberry',
      status: (i % 5 === 0 ? 'red' : i % 3 === 0 ? 'yellow' : 'green') as "green" | "yellow" | "red",
      timestamp: date,
      station: 'Cooling Room'
    };
  });

  return (
    <div className="p-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <ProductionGrid batches={mockBatches} />
      </div>
    </div>
  );
}
