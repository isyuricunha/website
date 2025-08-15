'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, Info, Calendar, Star, Zap, Shield, Code, Monitor, Smartphone, Headphones } from 'lucide-react'
import { Badge } from '@tszhong0411/ui'
import Link from './link'
import ItemGrid from './mdx/item-grid'

type CategoryIcon = {
  [key: string]: React.ComponentType<{ className?: string }>
}

const categoryIcons: CategoryIcon = {
  'Laptop': Monitor,
  'Accessories': Smartphone,
  'Gaming PC - Hardware': Zap,
  'Infra': Shield,
  'Stacks': Code
}

type UsesPageProps = {
  content: React.ReactNode
  lastUpdated?: string
}

type ComparisonItem = {
  name: string
  pros: string[]
  cons: string[]
  price: string
  rating: number
}

const ComparisonTable = ({ items, title }: { items: ComparisonItem[], title: string }) => {
  return (
    <div className='my-8 overflow-hidden rounded-lg border'>
      <div className='bg-muted/50 px-4 py-3 border-b'>
        <h3 className='text-sm sm:text-base font-semibold flex items-center gap-2'>
          <Star className='h-4 w-4 text-yellow-500' />
          {title}
        </h3>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-muted/20'>
            <tr>
              <th className='px-4 py-3 text-left text-xs sm:text-sm font-medium'>Tool</th>
              <th className='px-4 py-3 text-left text-xs sm:text-sm font-medium'>Pros</th>
              <th className='px-4 py-3 text-left text-xs sm:text-sm font-medium'>Cons</th>
              <th className='px-4 py-3 text-left text-xs sm:text-sm font-medium'>Price</th>
              <th className='px-4 py-3 text-left text-xs sm:text-sm font-medium'>Rating</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.name} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}>
                <td className='px-4 py-3 text-xs sm:text-sm font-medium'>{item.name}</td>
                <td className='px-4 py-3 text-xs sm:text-sm'>
                  <ul className='list-disc list-inside space-y-1'>
                    {item.pros.map((pro, i) => (
                      <li key={i} className='text-green-600 dark:text-green-400'>{pro}</li>
                    ))}
                  </ul>
                </td>
                <td className='px-4 py-3 text-xs sm:text-sm'>
                  <ul className='list-disc list-inside space-y-1'>
                    {item.cons.map((con, i) => (
                      <li key={i} className='text-red-600 dark:text-red-400'>{con}</li>
                    ))}
                  </ul>
                </td>
                <td className='px-4 py-3 text-xs sm:text-sm font-medium'>{item.price}</td>
                <td className='px-4 py-3'>
                  <div className='flex items-center gap-1'>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < item.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className='ml-1 text-xs text-muted-foreground'>({item.rating}/5)</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ExpandableSection = ({ 
  title, 
  children, 
  defaultExpanded = true,
  icon: Icon
}: { 
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
  icon?: React.ComponentType<{ className?: string }>
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className='mb-8 border rounded-lg overflow-hidden'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full px-4 py-4 bg-muted/20 hover:bg-muted/30 transition-colors flex items-center justify-between text-left'
      >
        <div className='flex items-center gap-3'>
          {Icon && <Icon className='h-5 w-5 text-primary' />}
          <h2 className='text-lg sm:text-xl font-semibold'>{title}</h2>
        </div>
        {isExpanded ? (
          <ChevronUp className='h-5 w-5 text-muted-foreground' />
        ) : (
          <ChevronDown className='h-5 w-5 text-muted-foreground' />
        )}
      </button>
      {isExpanded && (
        <div className='p-4 sm:p-6'>
          {children}
        </div>
      )}
    </div>
  )
}

const AffiliateDisclosure = () => (
  <div className='mb-8 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
    <div className='flex items-start gap-3'>
      <Info className='h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0' />
      <div>
        <h3 className='text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1'>
          Affiliate Disclosure
        </h3>
        <p className='text-xs sm:text-sm text-blue-800 dark:text-blue-200'>
          Some links on this page are affiliate links. This means I may earn a small commission 
          if you purchase through these links, at no additional cost to you. I only recommend 
          products I personally use and believe in.
        </p>
      </div>
    </div>
  </div>
)

const UsesPage = ({ content, lastUpdated }: UsesPageProps) => {
  // Sample comparison data for development tools
  const devToolsComparison: ComparisonItem[] = [
    {
      name: 'Docker',
      pros: ['Easy containerization', 'Great for development', 'Wide ecosystem'],
      cons: ['Resource intensive', 'Learning curve'],
      price: 'Free',
      rating: 5
    },
    {
      name: 'Kubernetes',
      pros: ['Excellent orchestration', 'Auto-scaling', 'Production ready'],
      cons: ['Complex setup', 'Steep learning curve'],
      price: 'Free',
      rating: 4
    },
    {
      name: 'Terraform',
      pros: ['Infrastructure as code', 'Multi-cloud', 'Great planning'],
      cons: ['State management', 'Can be complex'],
      price: 'Free/Paid',
      rating: 4
    }
  ]

  return (
    <div className='max-w-4xl mx-auto'>
      {/* Header with last updated */}
      <div className='mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold mb-2'>My Setup & Tools</h1>
          <p className='text-sm sm:text-base text-muted-foreground'>
            Everything I use to build, create, and stay productive
          </p>
        </div>
        {lastUpdated && (
          <Badge variant='outline' className='self-start sm:self-auto'>
            <Calendar className='h-3 w-3 mr-1' />
            Updated {lastUpdated}
          </Badge>
        )}
      </div>

      <AffiliateDisclosure />

      {/* Laptop Section */}
      <ExpandableSection title='Laptop' icon={categoryIcons['Laptop']}>
        <div className='mb-6'>
          <img
            src='/images/uses/ideapad-3i.png'
            alt='Ideapad Gaming 3 R7'
            className='w-full max-w-xs mx-auto rounded-lg shadow-lg object-contain h-48'
          />
        </div>
        <div className='bg-muted/20 p-4 rounded-lg'>
          <h3 className='text-sm sm:text-base font-semibold mb-2'>Why I chose this laptop:</h3>
          <ul className='text-xs sm:text-sm text-muted-foreground space-y-1'>
            <li>• Perfect balance of performance and portability</li>
            <li>• Great for development and occasional gaming</li>
            <li>• Excellent value for money</li>
          </ul>
        </div>
      </ExpandableSection>

      {/* Accessories Section */}
      <ExpandableSection title='Accessories' icon={categoryIcons['Accessories']}>
        <ItemGrid
          items={[
            {
              image: '/images/uses/accessories/s10.png',
              name: 'S10 5G',
              description: 'Black, 512GB',
              url: 'https://www.samsung.com/uk/smartphones/galaxy-s10.../',
              isAffiliate: false
            },
            {
              image: '/images/uses/accessories/quietcontrol30.png',
              name: 'Bose Quiet Control 30',
              description: 'Headphone',
              url: 'https://www.boselatam.com/en_ar/products/headphones/earbuds/quietcontrol-30.html',
              isAffiliate: true
            }
          ]}
        />
      </ExpandableSection>

      {/* Gaming PC Hardware Section */}
      <ExpandableSection title='Gaming PC - Hardware' icon={categoryIcons['Gaming PC - Hardware']}>
        <ItemGrid
          items={[
            {
              image: '/images/uses/gaming-pc/monitor.png',
              name: 'LG 27GR75Q-B',
              description: '27" 165hz Monitor',
              url: 'https://www.lg.com/us/monitors/lg-27gr75q-b-gaming-monitor',
              isAffiliate: true
            },
            {
              image: '/images/uses/gaming-pc/mx-ergo.png',
              name: 'Logitech MX Ergo+',
              description: 'Mouse',
              url: 'https://www.logitech.com/en-us/shop/p/mx-ergo-wireless-trackball-mouse.910-005177',
              isAffiliate: true
            },
            {
              image: '/images/uses/gaming-pc/wooting-60he.png',
              name: 'Wooting 60HE+',
              description: 'Wireless Custom Mechanical Keyboard',
              url: 'https://wooting.io/wooting-60he',
              isAffiliate: false
            }
          ]}
        />
        
        <div className='mt-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg'>
          <h3 className='text-sm font-semibold text-green-900 dark:text-green-100 mb-2'>
            💡 Pro Tip
          </h3>
          <p className='text-xs sm:text-sm text-green-800 dark:text-green-200'>
            When building a gaming PC, invest more in the GPU and CPU first. You can always upgrade 
            peripherals later, but the core components determine your overall performance.
          </p>
        </div>
      </ExpandableSection>

      {/* Infrastructure Tools Section */}
      <ExpandableSection title='Infrastructure & DevOps' icon={categoryIcons['Infra']}>
        <div className='mb-6'>
          <ItemGrid
            items={[
              {
                image: '/images/uses/software/docker.png',
                name: 'Docker',
                description: 'Container Platform',
                url: 'https://www.docker.com/',
                isAffiliate: false
              },
              {
                image: '/images/uses/software/kubernetes.png',
                name: 'Kubernetes',
                description: 'Container Orchestration',
                url: 'https://kubernetes.io/',
                isAffiliate: false
              },
              {
                image: '/images/uses/software/terraform.png',
                name: 'Terraform',
                description: 'Infrastructure as Code',
                url: 'https://www.terraform.io/',
                isAffiliate: false
              }
            ]}
          />
        </div>
        
        <ComparisonTable 
          items={devToolsComparison}
          title='Infrastructure Tools Comparison'
        />
      </ExpandableSection>

      {/* Development Stacks Section */}
      <ExpandableSection title='Development Stacks' icon={categoryIcons['Stacks']}>
        <ItemGrid
          items={[
            {
              image: '/images/uses/software/elk.png',
              name: 'ELK Stack',
              description: 'Elasticsearch, Logstash & Kibana for log analysis',
              url: 'https://www.elastic.co/what-is/elk-stack',
              isAffiliate: false
            },
            {
              image: '/images/uses/software/mern.png',
              name: 'MERN Stack',
              description: 'MongoDB, Express, React & Node.js',
              url: 'https://en.wikipedia.org/wiki/MERN_stack',
              isAffiliate: false
            },
            {
              image: '/images/uses/software/jam.png',
              name: 'JAM Stack',
              description: 'JavaScript, APIs & Markup',
              url: 'https://jamstack.org/',
              isAffiliate: false
            }
          ]}
        />
      </ExpandableSection>
    </div>
  )
}

export default UsesPage
