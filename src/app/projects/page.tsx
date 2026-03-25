import Image from 'next/image'
import Link from 'next/link'
import { FileText, ChevronRight, Calculator, CheckCircle2, Download } from 'lucide-react'

const PROJECTS = [
  {
    id: 'highvill-premium',
    title: 'ЖК Highvill (Astana)',
    category: 'Премиум апартаменты',
    description: 'Полная комплектация мастер-санузла и гостевой зоны в стиле неоклассика.',
    items: ['Отдельностоящая ванна', 'Смесители Gessi', 'Керамика Villeroy & Boch', 'Системы скрытого монтажа'],
    price: '4 850 000 ₸',
    image: 'https://images.unsplash.com/photo-1620626011761-9963d7521476?q=80&w=1200'
  },
  {
    id: 'bi-village-house',
    title: 'BI Village (Almaty)',
    category: 'Загородный дом',
    description: 'Инженерная смета отопления и водоснабжения для дома площадью 350 м².',
    items: ['Котел Viessmann', 'Бойлер косвенного нагрева', 'Трубы Rehau', 'Радиаторы Zehnder'],
    price: '8 200 000 ₸',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200'
  },
  {
    id: 'loft-residence',
    title: 'Loft Residence',
    category: 'Дизайнерский лофт',
    description: 'Минималистичные решения в индустриальном стиле с черной матовой сантехникой.',
    items: ['Душевая зона Walk-in', 'Черные смесители Hansgrohe', 'Бетонные раковины', 'Инсталляции Tece'],
    price: '3 150 000 ₸',
    image: 'https://images.unsplash.com/photo-1600566752355-3979ff1040ad?q=80&w=1200'
  },
  {
    id: 'office-center-it',
    title: 'Бизнес-центр (IT HUB)',
    category: 'Общественные зоны',
    description: 'Антивандальные и бесконтактные решения для высокой проходимости.',
    items: ['Сенсорные смесители', 'Автоматические смывы', 'Сушилки Dyson', 'Нержавеющая сталь'],
    price: '12 600 000 ₸',
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1200'
  },
  {
    id: 'restaurant-kitchen',
    title: 'Ресторан "Grand Cru"',
    category: 'Horeca / Кухня',
    description: 'Профессиональное кухонное водоснабжение и гостевые санузлы.',
    items: ['Профессиональные души', 'Жироуловители', 'Мойки из стали 304', 'Фильтрация воды'],
    price: '2 400 000 ₸',
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1200'
  }
]

export default function ProjectsLandingPage() {
  return (
    <div className="bg-white min-h-screen font-sans animate-page-in">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 bg-[#F0EEEA]">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-gray-200 pb-16">
            <div className="max-w-4xl">
              <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-accent mb-6 block">
                Engineering & Design Service
              </span>
              <h1 className="text-7xl md:text-[10rem] leading-[0.85] font-serif text-primary tracking-tighter uppercase mb-0">
                Наши <br />
                <span className="italic font-light text-accent ml-0 md:ml-32">Сметы</span>
              </h1>
            </div>
            <div className="max-w-[320px] pb-4">
              <p className="text-gray-400 text-[12px] uppercase tracking-widest leading-relaxed">
                Профессиональный расчет спецификаций для объектов любой сложности. От квартир до бизнес-центров.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / Process */}
      <section className="py-24 bg-white border-b border-gray-50">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-20">
          <div className="flex flex-col gap-6">
            <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center">
              <Calculator className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-lg font-serif italic text-primary">Точный расчет</h3>
            <p className="text-gray-500 text-xs uppercase tracking-widest leading-loose">Учитываем каждую деталь: от труб и фитингов до чистовых приборов и аксессуаров.</p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-lg font-serif italic text-primary">B2B Условия</h3>
            <p className="text-gray-500 text-xs uppercase tracking-widest leading-loose">Специальные цены для дизайнеров, архитекторов и строительных компаний.</p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center">
              <Download className="w-5 h-5 text-accent" />
            </div>
            <h3 className="text-lg font-serif italic text-primary">Готовый формат</h3>
            <p className="text-gray-500 text-xs uppercase tracking-widest leading-loose">Вы получаете готовую спецификацию в PDF или Excel для вашего проекта или заказчика.</p>
          </div>
        </div>
      </section>

      {/* Cases / Examples List */}
      <section className="py-24 md:py-40 container mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-serif text-primary mb-20 italic">Примеры реализованных <span className="text-accent underline underline-offset-8 decoration-1">проектов</span></h2>
        
        <div className="flex flex-col gap-32 md:gap-48">
          {PROJECTS.map((project, index) => (
            <div key={project.id} className={`flex flex-col md:flex-row gap-12 md:gap-24 items-center ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
              <div className="w-full md:w-1/2 aspect-[16/10] relative overflow-hidden bg-surface group">
                <Image 
                  src={project.image} 
                  alt={project.title} 
                  fill 
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                />
              </div>
              <div className="w-full md:w-1/2">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-accent mb-4 block">{project.category}</span>
                <h3 className="text-4xl md:text-6xl font-serif text-primary mb-8 tracking-tight">{project.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md italic">{project.description}</p>
                
                <div className="mb-10">
                   <h4 className="text-[10px] uppercase tracking-widest font-black text-primary mb-4 border-b border-gray-100 pb-2">Основные позиции:</h4>
                   <ul className="grid grid-cols-2 gap-y-3 gap-x-4">
                     {project.items.map((item, i) => (
                       <li key={i} className="flex items-center gap-2 text-[11px] text-gray-400 uppercase tracking-wider">
                         <div className="w-1 h-1 bg-accent rounded-full" /> {item}
                       </li>
                     ))}
                   </ul>
                </div>

                <div className="flex items-baseline gap-4 mb-10">
                   <span className="text-gray-300 text-[10px] uppercase tracking-widest">Ориентировочная стоимость:</span>
                   <span className="text-3xl font-serif text-primary">{project.price}</span>
                </div>

                <Link href="/contacts" className="btn-outline border-primary/10 hover:border-accent hover:bg-accent hover:text-white transition-all h-14 px-8 inline-flex items-center justify-center text-[10px] uppercase tracking-[0.2em] font-bold rounded-xl group">
                  Заказать подробный отчет <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Professional CTA */}
      <section className="py-40 bg-primary text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="container mx-auto px-6 relative z-10">
          <h2 className="text-5xl md:text-7xl text-white font-serif italic mb-12">Есть готовый проект?</h2>
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-16 max-w-2xl mx-auto leading-loose font-medium">
            Загрузите вашу спецификацию или отправьте нам проект в любом удобном формате (PDF, Excel, фото). Мы сделаем расчет и предложим лучшие условия за 24 часа.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
             <Link href="/contacts" className="bg-white text-primary px-16 h-20 flex items-center justify-center rounded-full font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-accent hover:text-white transition-all min-w-[300px]">
               Отправить проект
             </Link>
             <Link href="/catalog" className="border border-white/20 text-white px-16 h-20 flex items-center justify-center rounded-full font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-white hover:text-primary transition-all min-w-[300px]">
               Собрать в каталоге
             </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
