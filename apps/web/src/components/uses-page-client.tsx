'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  Star,
  Zap,
  Shield,
  Code,
  Monitor,
  Smartphone
} from 'lucide-react'
import { Badge } from '@isyuricunha/ui'
import { useTranslations } from '@isyuricunha/i18n/client'
import Image from 'next/image'

type CategoryIcon = {
  [key: string]: React.ComponentType<{ className?: string }>
}

const categoryIcons: CategoryIcon = {
  Laptop: Monitor,
  Accessories: Smartphone,
  'Gaming PC - Hardware': Zap,
  Infra: Shield,
  Stacks: Code
}

type ComparisonItem = {
  name: string
  pros: string[]
  cons: string[]
  price: string
  rating: number
}

const ComparisonTable = ({ items, title }: { items: ComparisonItem[]; title: string }) => {
  const t = useTranslations('component.uses-page')
  return (
    <div className='bg-bg-surface my-8 overflow-hidden rounded-lg border border-[var(--border-subtle)]'>
      <div className='bg-bg-elevated border-b border-[var(--border-faint)] px-4 py-3'>
        <h3 className='flex items-center gap-2 text-sm font-medium sm:text-base'>
          <Star className='text-accent-earth-text h-4 w-4' />
          {title}
        </h3>
      </div>
      <div className='overflow-x-auto p-1'>
        <table className='w-full min-w-[1100px] table-fixed border-separate border-spacing-0'>
          <thead className='bg-bg-elevated'>
            <tr>
              <th className='text-muted-foreground w-[16%] px-6 py-4 text-left text-xs font-medium tracking-wider uppercase'>
                {t('table.headers.tool')}
              </th>
              <th className='text-muted-foreground w-[34%] px-6 py-4 text-left text-xs font-medium tracking-wider uppercase'>
                {t('table.headers.pros')}
              </th>
              <th className='text-muted-foreground w-[34%] px-6 py-4 text-left text-xs font-medium tracking-wider uppercase'>
                {t('table.headers.cons')}
              </th>
              <th className='text-muted-foreground w-[10%] px-6 py-4 text-left text-xs font-medium tracking-wider uppercase'>
                {t('table.headers.price')}
              </th>
              <th className='text-muted-foreground w-[6%] px-6 py-4 text-left text-xs font-medium tracking-wider uppercase'>
                {t('table.headers.rating')}
              </th>
            </tr>
          </thead>
          <tbody className='divide-border divide-y'>
            {items.map((item, index) => (
              <tr key={index} className='hover:bg-bg-hover transition-colors'>
                <td className='border-border/50 border-r px-8 py-6 align-top'>
                  <div className='mr-4 text-sm leading-relaxed font-medium break-words'>
                    {item.name}
                  </div>
                </td>
                <td className='border-border/50 border-r px-8 py-6 align-top'>
                  <ul className='text-accent-earth-text mr-4 space-y-2 text-xs leading-relaxed'>
                    {item.pros.map((pro, i) => (
                      <li key={i} className='break-words'>
                        • {pro}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className='border-border/50 border-r px-8 py-6 align-top'>
                  <ul className='text-muted-foreground mr-4 space-y-2 text-xs leading-relaxed'>
                    {item.cons.map((con, i) => (
                      <li key={i} className='break-words'>
                        • {con}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className='border-border/50 border-r px-8 py-6 align-top'>
                  <span className='mr-4 text-sm break-words'>{item.price}</span>
                </td>
                <td className='px-8 py-6 align-top'>
                  <div className='flex flex-col items-start gap-1'>
                    <div className='flex'>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < item.rating
                              ? 'text-accent-earth-text fill-current'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                    <span className='text-muted-foreground text-xs whitespace-nowrap'>
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
    <div className='bg-bg-surface mb-8 overflow-hidden rounded-lg border border-[var(--border-subtle)]'>
      <button
        type='button'
        onClick={() => setIsExpanded(!isExpanded)}
        className='bg-bg-elevated hover:bg-bg-hover flex w-full items-center justify-between px-4 py-4 text-left transition-colors'
      >
        <div className='flex items-center gap-3'>
          {IconComponent && <IconComponent className='text-accent-earth-text h-5 w-5' />}
          <h2 className='text-lg font-medium tracking-tighter sm:text-xl'>{title}</h2>
        </div>
        {isExpanded ? (
          <ChevronUp className='text-muted-foreground h-5 w-5' />
        ) : (
          <ChevronDown className='text-muted-foreground h-5 w-5' />
        )}
      </button>
      {isExpanded && <div className='p-4 sm:p-6'>{children}</div>}
    </div>
  )
}

const AffiliateDisclosure = () => {
  const t = useTranslations('component.uses-page')
  return (
    <div className='mb-8 rounded-lg border border-[var(--accent-border)] bg-[var(--accent-dim)] p-4'>
      <div className='flex items-start gap-3'>
        <Info className='text-accent-earth-text mt-0.5 h-5 w-5 flex-shrink-0' />
        <div>
          <h3 className='text-text-primary mb-1 text-sm font-medium'>{t('affiliate.title')}</h3>
          <p className='text-muted-foreground text-xs sm:text-sm'>{t('affiliate.description')}</p>
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
      pros: [
        t('tools.kubernetes.pros.0'),
        t('tools.kubernetes.pros.1'),
        t('tools.kubernetes.pros.2')
      ],
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
    <div className='mx-auto max-w-4xl'>
      {/* Header with last updated */}
      <div className='mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <h1 className='mb-2 text-[clamp(32px,4vw,52px)] leading-[1.08] font-normal tracking-tighter'>
            {title}
          </h1>
          <p className='text-muted-foreground text-sm sm:text-base'>{description}</p>
        </div>
        <Badge variant='outline' className='self-start sm:self-auto'>
          <Calendar className='mr-1 h-3 w-3' />
          {t('badge.updated-recently')}
        </Badge>
      </div>

      <AffiliateDisclosure />

      {/* Enhanced MDX content wrapper with interactive sections */}
      {mdxContent && <div className='uses-content-wrapper'>{mdxContent}</div>}

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
                className='mx-auto h-48 w-full max-w-xs rounded-lg object-contain shadow-lg'
              />
            </div>
            <div className='bg-bg-surface rounded-lg border border-[var(--border-subtle)] p-4'>
              <h3 className='mb-2 text-sm font-medium sm:text-base'>
                {t('sections.laptop.why-title')}
              </h3>
              <ul className='text-muted-foreground space-y-1 text-xs sm:text-sm'>
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
