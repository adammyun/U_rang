import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/server-e2e',outputDir:'test-results-server',workers:1,
 reporter:[['list'],['html',{open:'never',outputFolder:'playwright-report-server'}]],
 use:{baseURL:'http://localhost:5197',screenshot:'only-on-failure',trace:'retain-on-failure'},
 projects:[
  {name:'desktop-chromium',use:{browserName:'chromium',viewport:{width:1440,height:900}}},
  {name:'mobile-chromium',use:{browserName:'chromium',viewport:{width:390,height:844},hasTouch:true,isMobile:true}},
  {name:'desktop-webkit',use:{browserName:'webkit',viewport:{width:1440,height:900}}},
  {name:'mobile-webkit',use:{browserName:'webkit',viewport:{width:390,height:844},hasTouch:true,isMobile:true}},
 ],
 // Run pnpm db:setup once before the server suite on a fresh checkout.
 webServer:{command:'pnpm dev --port 5197',url:'http://localhost:5197',reuseExistingServer:!process.env.CI,timeout:120000},
});
