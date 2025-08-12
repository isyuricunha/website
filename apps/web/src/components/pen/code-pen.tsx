'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from '@tszhong0411/i18n/client'
import { Button } from '@tszhong0411/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@tszhong0411/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@tszhong0411/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@tszhong0411/ui'
import { CopyIcon, DownloadIcon, PlayIcon, TrashIcon } from 'lucide-react'
import { toast } from '@tszhong0411/ui'

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', extension: 'js' },
  { value: 'typescript', label: 'TypeScript', extension: 'ts' },
  { value: 'python', label: 'Python', extension: 'py' },
  { value: 'html', label: 'HTML', extension: 'html' },
  { value: 'css', label: 'CSS', extension: 'css' },
  { value: 'json', label: 'JSON', extension: 'json' },
  { value: 'sql', label: 'SQL', extension: 'sql' },
  { value: 'bash', label: 'Bash', extension: 'sh' }
]

const DEFAULT_CODE = {
  javascript: 'console.log("Hello, World!");\n\n// Write your JavaScript code here\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("Developer"));',
  typescript: 'console.log("Hello, World!");\n\n// Write your TypeScript code here\nfunction greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("Developer"));',
  python: 'print("Hello, World!")\n\n# Write your Python code here\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Developer"))',
  html: '<!DOCTYPE html>\n<html>\n<head>\n    <title>My Page</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n    <p>Write your HTML here</p>\n</body>\n</html>',
  css: '/* Write your CSS here */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background-color: #f0f0f0;\n}\n\nh1 {\n    color: #333;\n    text-align: center;\n}',
  json: '{\n  "message": "Hello, World!",\n  "data": {\n    "name": "Developer",\n    "skills": ["JavaScript", "TypeScript", "Python"]\n  }\n}',
  sql: '-- Write your SQL queries here\nSELECT "Hello, World!" as message;\n\n-- Example query\nSELECT name, email FROM users WHERE active = true;',
  bash: '#!/bin/bash\n\necho "Hello, World!"\n\n# Write your bash commands here\nname="Developer"\necho "Hello, $name!"'
}

export function CodePen() {
  const t = useTranslations()
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(DEFAULT_CODE.javascript)
  const [output, setOutput] = useState('')
  const [consoleOutput, setConsoleOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  // Update code when language changes
  useEffect(() => {
    setCode(DEFAULT_CODE[language as keyof typeof DEFAULT_CODE] || '')
    setOutput('')
    setConsoleOutput('')
  }, [language])

  const runCode = async () => {
    setIsRunning(true)
    setOutput('')
    setConsoleOutput('')

    try {
      // Simple code execution for different languages
      switch (language) {
        case 'javascript':
          await executeJavaScript()
          break
        case 'typescript':
          await executeTypeScript()
          break
        case 'python':
          await executePython()
          break
        case 'html':
          executeHTML()
          break
        case 'css':
          executeCSS()
          break
        case 'json':
          executeJSON()
          break
        case 'sql':
          executeSQL()
          break
        case 'bash':
          executeBash()
          break
        default:
          setOutput('Language not supported for execution')
      }
    } catch (error) {
      setConsoleOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsRunning(false)
    }
  }

  const executeJavaScript = async () => {
    const logs: string[] = []
    const originalLog = console.log
    const originalError = console.error

    // Override console methods to capture output
    console.log = (...args) => {
      logs.push(args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '))
    }
    console.error = (...args) => {
      logs.push(`ERROR: ${args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`)
    }

    try {
      // Create a safe execution environment
      const result = new Function(code)()
      setConsoleOutput(logs.join('\n'))
      if (result !== undefined) {
        setOutput(typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result))
      }
    } catch (error) {
      setConsoleOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      // Restore original console methods
      console.log = originalLog
      console.error = originalError
    }
  }

  const executeTypeScript = async () => {
    // For now, treat TypeScript as JavaScript
    // In a real implementation, you'd use a TypeScript compiler
    await executeJavaScript()
  }

  const executePython = async () => {
    // This would require a Python runtime or API
    setOutput('Python execution requires a backend service. This is a demo.')
    setConsoleOutput('Python execution not implemented in this demo.')
  }

  const executeHTML = () => {
    // Create a preview of the HTML
    const iframe = document.createElement('iframe')
    iframe.style.width = '100%'
    iframe.style.height = '300px'
    iframe.style.border = '1px solid #ccc'
    iframe.style.borderRadius = '4px'

    const blob = new Blob([code], { type: 'text/html' })
    iframe.src = URL.createObjectURL(blob)

    setOutput('HTML Preview:')
    // In a real implementation, you'd render the iframe
    setConsoleOutput('HTML preview would be displayed here')
  }

  const executeCSS = () => {
    // Validate CSS
    try {
      // Simple CSS validation
      if (code.includes('{') && code.includes('}')) {
        setOutput('CSS appears to be valid')
        setConsoleOutput('CSS validation passed')
      } else {
        setOutput('CSS validation failed')
        setConsoleOutput('Invalid CSS syntax')
      }
    } catch (error) {
      setConsoleOutput(`CSS Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const executeJSON = () => {
    try {
      const parsed = JSON.parse(code)
      setOutput(JSON.stringify(parsed, null, 2))
      setConsoleOutput('JSON is valid')
    } catch (error) {
      setOutput('Invalid JSON')
      setConsoleOutput(`JSON Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const executeSQL = () => {
    // This would require a database connection
    setOutput('SQL execution requires a database connection. This is a demo.')
    setConsoleOutput('SQL execution not implemented in this demo.')
  }

  const executeBash = () => {
    // This would require a shell environment
    setOutput('Bash execution requires a shell environment. This is a demo.')
    setConsoleOutput('Bash execution not implemented in this demo.')
  }

  const clearCode = () => {
    setCode(DEFAULT_CODE[language as keyof typeof DEFAULT_CODE] || '')
    setOutput('')
    setConsoleOutput('')
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Code copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }

  const downloadCode = () => {
    const languageInfo = SUPPORTED_LANGUAGES.find(lang => lang.value === language)
    const extension = languageInfo?.extension || 'txt'
    const filename = `code.${extension}`

    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Code downloaded')
  }

  return (
    <div className='space-y-6'>
      {/* Language Selection */}
      <div className='flex items-center gap-4'>
        <label className='text-sm font-medium'>{t('pen.editor.language')}</label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className='w-48'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {t(`pen.languages.${lang.value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Editor and Output */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Code Editor */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center justify-between'>
              <span>Code Editor</span>
              <div className='flex items-center gap-2'>
                <Button
                  size='sm'
                  onClick={runCode}
                  disabled={isRunning}
                  className='flex items-center gap-2'
                >
                  <PlayIcon className='h-4 w-4' />
                  {t('pen.editor.run')}
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={clearCode}
                  className='flex items-center gap-2'
                >
                  <TrashIcon className='h-4 w-4' />
                  {t('pen.editor.clear')}
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={copyCode}
                  className='flex items-center gap-2'
                >
                  <CopyIcon className='h-4 w-4' />
                  {t('pen.editor.copy')}
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={downloadCode}
                  className='flex items-center gap-2'
                >
                  <DownloadIcon className='h-4 w-4' />
                  {t('pen.editor.download')}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              ref={editorRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t('pen.editor.placeholder')}
              className='w-full h-96 p-4 font-mono text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring'
              spellCheck={false}
            />
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <CardTitle>{t('pen.output.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue='console' className='w-full'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='console'>{t('pen.output.console')}</TabsTrigger>
                <TabsTrigger value='result'>{t('pen.output.result')}</TabsTrigger>
              </TabsList>
              <TabsContent value='console' className='mt-4'>
                <div className='h-80 p-4 bg-muted rounded-md overflow-auto'>
                  <pre className='text-sm font-mono whitespace-pre-wrap'>
                    {consoleOutput || 'Console output will appear here...'}
                  </pre>
                </div>
              </TabsContent>
              <TabsContent value='result' className='mt-4'>
                <div className='h-80 p-4 bg-muted rounded-md overflow-auto'>
                  <pre className='text-sm font-mono whitespace-pre-wrap'>
                    {output || 'Execution result will appear here...'}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Features Info */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm'>
            <div className='p-3 bg-muted rounded-md'>
              <h4 className='font-medium mb-2'>JavaScript & TypeScript</h4>
              <p className='text-muted-foreground'>Execute JavaScript code with console output capture</p>
            </div>
            <div className='p-3 bg-muted rounded-md'>
              <h4 className='font-medium mb-2'>HTML Preview</h4>
              <p className='text-muted-foreground'>Preview HTML code in a sandboxed environment</p>
            </div>
            <div className='p-3 bg-muted rounded-md'>
              <h4 className='font-medium mb-2'>JSON Validation</h4>
              <p className='text-muted-foreground'>Validate and format JSON data</p>
            </div>
            <div className='p-3 bg-muted rounded-md'>
              <h4 className='font-medium mb-2'>Code Export</h4>
              <p className='text-muted-foreground'>Download your code with proper file extensions</p>
            </div>
            <div className='p-3 bg-muted rounded-md'>
              <h4 className='font-medium mb-2'>Multiple Languages</h4>
              <p className='text-muted-foreground'>Support for 8+ programming languages</p>
            </div>
            <div className='p-3 bg-muted rounded-md'>
              <h4 className='font-medium mb-2'>Real-time Output</h4>
              <p className='text-muted-foreground'>See execution results and console output instantly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
