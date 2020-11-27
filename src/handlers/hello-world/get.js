import { Logger } from '@lambda/logger'
const chromium = require('chrome-aws-lambda')

process.env['PATH'] =
  process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'] + '/resources'

export const handler = async (event, context) => {
  const log = new Logger()
  log.init(event, context)
  log.info('start')
  let browser = null
  try {
    const html = '<h1>Test</h1><p>Hello world</p>'
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true
    })

    const page = await browser.newPage()
    page.setContent(html)

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    })

    const response = {
      headers: {
        'Content-type': 'application/pdf',
        'content-disposition': 'attachment; filename=test.pdf'
      },
      statusCode: 200,
      body: pdf.toString('base64'),
      isBase64Encoded: true
    }
    return response
  } catch (error) {
    log.error('erorr', { error })
    throw error
  } finally {
    if (browser !== null) {
      await browser.close()
    }
  }
}
