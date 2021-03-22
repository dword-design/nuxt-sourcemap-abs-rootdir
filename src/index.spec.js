import { endent, property } from '@dword-design/functions'
import tester from '@dword-design/tester'
import axios from 'axios'
import { outputFile } from 'fs-extra'
import { Builder, Nuxt } from 'nuxt'
import withLocalTmpDir from 'with-local-tmp-dir'

export default tester({
  works: () =>
    withLocalTmpDir(async () => {
      const source = endent`
        export default {
          render: h => <div class="foo">Hello world</div>,
        }
      `
      await outputFile('pages/index.js', source)
      const nuxt = new Nuxt({ dev: true, modules: ['~/../src'] })
      await new Builder(nuxt).build()
      await nuxt.listen()
      try {
        const content =
          axios.get('http://localhost:3000/_nuxt/pages/index.js')
          |> await
          |> property('data')
        const sourceMappingUrlMatch = content.match(
          /\\n\/\/# sourceMappingURL=data:application\/json;charset=utf-8;base64,(.*?)\\n/
        )
        console.log(content)
        console.log(sourceMappingUrlMatch)
        console.log(Buffer.from(sourceMappingUrlMatch[1], 'base64').toString('utf-8'))
        const sourceMapping = JSON.parse(
          Buffer.from(sourceMappingUrlMatch[1], 'base64').toString('utf-8')
        )
        expect(sourceMapping).toEqual({
          file: './pages/index.js.js',
          mappings:
            'AAAA;AAAe;AACbA,QAAM,EAAE,gBAAAC,CAAC;AAAA;AAAA,eAAe;AAAf;AAAA;AADI,CAAf',
          names: ['render', 'h'],
          sourceRoot: process.cwd(),
          sources: ['webpack:///./pages/index.js?44d8'],
          sourcesContent: [source],
          version: 3,
        })
      } finally {
        await nuxt.close()
      }
    }),
})
