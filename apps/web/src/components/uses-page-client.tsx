'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Info, Calendar, Star, Zap, Shield, Code, Monitor, Smartphone } from 'lucide-react'
import { Badge } from '@tszhong0411/ui'
import { useTranslations } from '@tszhong0411/i18n/client'
import Image from 'next/image'

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

type ComparisonItem = {
  name: string
  pros: string[]
  cons: string[]
  price: string
  rating: number
}

const ComparisonTable = ({ items, title }: { items: ComparisonItem[], title: string }) => {
  const t = useTranslations('component.uses-page')
  return (
    <div className='my-8 overflow-hidden rounded-lg border'>
      <div className='bg-muted/50 px-4 py-3 border-b'>
        <h3 className='text-sm sm:text-base font-semibold flex items-center gap-2'>
          <Star className='h-4 w-4 text-yellow-500' />
          {title}
        </h3>
      </div>
      <div className='overflow-x-auto p-1'>
        <table className='w-full min-w-[1100px] table-fixed border-separate border-spacing-0'>
          <thead className='bg-muted/20'>
            <tr>
              <th className='px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[16%]'>
                {t('table.headers.tool')}
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[34%]'>
                {t('table.headers.pros')}
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[34%]'>
                {t('table.headers.cons')}
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[10%]'>
                {t('table.headers.price')}
              </th>
              <th className='px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-[6%]'>
                {t('table.headers.rating')}
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {items.map((item, index) => (
              <tr key={index} className='hover:bg-muted/30 transition-colors'>
                <td className='px-8 py-6 align-top border-r border-border/50'>
                  <div className='text-sm font-medium break-words leading-relaxed mr-4'>{item.name}</div>
                </td>
                <td className='px-8 py-6 align-top border-r border-border/50'>
                  <ul className='text-xs text-green-600 dark:text-green-400 space-y-2 leading-relaxed mr-4'>
                    {item.pros.map((pro, i) => (
                      <li key={i} className='break-words'>• {pro}</li>
                    ))}
                  </ul>
                </td>
                <td className='px-8 py-6 align-top border-r border-border/50'>
                  <ul className='text-xs text-red-600 dark:text-red-400 space-y-2 leading-relaxed mr-4'>
                    {item.cons.map((con, i) => (
                      <li key={i} className='break-words'>• {con}</li>
                    ))}
                  </ul>
                </td>
                <td className='px-8 py-6 align-top border-r border-border/50'>
                  <span className='text-sm break-words mr-4'>{item.price}</span>
                </td>
                <td className='px-8 py-6 align-top'>
                  <div className='flex flex-col items-start gap-1'>
                    <div className='flex'>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < item.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <span className='text-xs text-muted-foreground whitespace-nowrap'>
                      {t('table.rating-out-of', { rating: item.rating })}
                    </span>
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
  icon
}: {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
  icon?: string | React.ComponentType<{ className?: string }>
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  // Get icon component from string name or use passed component
  const IconComponent = typeof icon === 'string' ? categoryIcons[icon] : icon

  return (
    <div className='mb-8 border rounded-lg overflow-hidden'>
      <button
        type='button'
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full px-4 py-4 bg-muted/20 hover:bg-muted/30 transition-colors flex items-center justify-between text-left'
      >
        <div className='flex items-center gap-3'>
          {IconComponent && <IconComponent className='h-5 w-5 text-primary' />}
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

const AffiliateDisclosure = () => {
  const t = useTranslations('component.uses-page')
  return (
    <div className='mb-8 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
      <div className='flex items-start gap-3'>
        <Info className='h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0' />
        <div>
          <h3 className='text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1'>
            {t('affiliate.title')}
          </h3>
          <p className='text-xs sm:text-sm text-blue-800 dark:text-blue-200'>
            {t('affiliate.description')}
          </p>
        </div>
      </div>
    </div>
  )
}

type UsesPageClientProps = {
  title: string
  description: string
  mdxContent?: React.ReactNode
}

const UsesPageClient = ({ title, description, mdxContent }: UsesPageClientProps) => {
  const t = useTranslations('component.uses-page')
  // Sample comparison data for development tools
  const devToolsComparison: ComparisonItem[] = [
    {
      name: 'Docker',
      pros: [t('tools.docker.pros.0'), t('tools.docker.pros.1'), t('tools.docker.pros.2')],
      cons: [t('tools.docker.cons.0'), t('tools.docker.cons.1')],
      price: t('tools.common.price.free'),
      rating: 5
    },
    {
      name: 'Kubernetes',
      pros: [t('tools.kubernetes.pros.0'), t('tools.kubernetes.pros.1'), t('tools.kubernetes.pros.2')],
      cons: [t('tools.kubernetes.cons.0'), t('tools.kubernetes.cons.1')],
      price: t('tools.common.price.free'),
      rating: 4
    },
    {
      name: 'Terraform',
      pros: [t('tools.terraform.pros.0'), t('tools.terraform.pros.1'), t('tools.terraform.pros.2')],
      cons: [t('tools.terraform.cons.0'), t('tools.terraform.cons.1')],
      price: t('tools.common.price.free-paid'),
      rating: 4
    }
  ]

  return (
    <div className='max-w-4xl mx-auto'>
      {/* Header with last updated */}
      <div className='mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-bold mb-2'>{title}</h1>
          <p className='text-sm sm:text-base text-muted-foreground'>
            {description}
          </p>
        </div>
        <Badge variant='outline' className='self-start sm:self-auto'>
          <Calendar className='h-3 w-3 mr-1' />
          {t('badge.updated-recently')}
        </Badge>
      </div>

      <AffiliateDisclosure />

      {/* Enhanced MDX content wrapper with interactive sections */}
      {mdxContent && (
        <div className='uses-content-wrapper'>
          {mdxContent}
        </div>
      )}

      {/* Fallback content if no MDX */}
      {!mdxContent && (
        <>
          {/* Laptop Section */}
          <ExpandableSection title={t('sections.laptop.title')} icon={categoryIcons['Laptop']}>
            <div className='mb-6'>
              <Image
                src='/images/uses/ideapad-3i.png'
                alt='Ideapad Gaming 3 R7'
                width={512}
                height={192}
                sizes='(max-width: 640px) 100vw, 512px'
                className='w-full max-w-xs mx-auto rounded-lg shadow-lg object-contain h-48'
              />
            </div>
            <div className='bg-muted/20 p-4 rounded-lg'>
              <h3 className='text-sm sm:text-base font-semibold mb-2'>{t('sections.laptop.why-title')}</h3>
              <ul className='text-xs sm:text-sm text-muted-foreground space-y-1'>
                <li>• {t('sections.laptop.reasons.0')}</li>
                <li>• {t('sections.laptop.reasons.1')}</li>
                <li>• {t('sections.laptop.reasons.2')}</li>
              </ul>
            </div>
          </ExpandableSection>

          {/* Infrastructure Tools Section with Comparison Table */}
          <ExpandableSection title={t('sections.infra-devops.title')} icon={categoryIcons['Infra']}>
            <ComparisonTable
              items={devToolsComparison}
              title={t('sections.infra-devops.comparison-title')}
            />
          </ExpandableSection>
        </>
      )}
    </div>
  )
}

export default UsesPageClient
export { ExpandableSection, ComparisonTable, AffiliateDisclosure }
