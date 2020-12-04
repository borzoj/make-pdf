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
    const { content, options } = JSON.parse(event.body)
    const { format, margin } = options
    const { top, right, bottom, left } = margin

    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true
    })

    const page = await browser.newPage()

    page.setContent(content)

    const pdf = await page.pdf({
      format,
      printBackground: true,
      margin: { top, right, bottom, left }
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
    log.error('error', { error })
    throw error
  } finally {
    if (browser !== null) {
      await browser.close()
    }
  }
}
