import { defineConfig } from 'vite'
import createExternal from "vite-plugin-external";
import path from 'path';

export default defineConfig({
    resolve: {

    },
    plugins: [
        // createExternal({
        //   externals: {
        //     'p5': 'p5'
        //   }
        // })
    ],
    build: {
        rolldownOptions: {
            external: ['p5'],
            output: {
                dir: '../central/webapp',
                globals: {
                    p5: 'p5'
                }
            }
        }
    }
})