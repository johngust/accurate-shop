export const runtime = "edge";

export default function DeliveryPage() {
  return (
    <div className="container mx-auto px-6 py-32 font-sans">
      <h1 className="text-5xl font-serif italic text-primary mb-12">Доставка и оплата</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
        <div className="space-y-8">
          <section>
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-accent mb-4">Способы доставки</h2>
            <ul className="space-y-4 text-gray-600">
              <li>• Курьерская доставка по Алматы (день в день)</li>
              <li>• Транспортные компании по всему Казахстану</li>
              <li>• Самовывоз из нашего шоурума</li>
            </ul>
          </section>
          <section>
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-accent mb-4">Оплата</h2>
            <ul className="space-y-4 text-gray-600">
              <li>• Kaspi QR / Kaspi Gold</li>
              <li>• Оплата картой на сайте (Visa/Mastercard)</li>
              <li>• Безналичный расчет для юрлиц</li>
            </ul>
          </section>
        </div>
        <div className="bg-gray-50 p-12 rounded-3xl border border-gray-100">
          <p className="text-sm text-gray-400 uppercase tracking-widest leading-loose">
            Мы заботимся о сохранности вашей сантехники. Крупногабаритные грузы (ванны, мебель) доставляются в усиленной упаковке с обязательным страхованием груза.
          </p>
        </div>
      </div>
    </div>
  )
}
