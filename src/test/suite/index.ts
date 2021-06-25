import * as chai from "chai";
import * as glob from "glob";
import * as Mocha from "mocha";
import * as path from "path";
import * as sinon from "sinon";
import * as sinonChai from "sinon-chai";
import { closeAllEditors } from "../testHelpers";

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "bdd",
    color: true
  });

  chai.use(sinonChai);

  mocha.rootHooks({
    async afterEach() {
      sinon.restore();
    },
    async afterAll() {
      closeAllEditors();
    }
  });

  const testsRoot = path.resolve(__dirname, "..");

  return new Promise(function (c, e) {
    glob("**/**.test.js", { cwd: testsRoot }, (err, files) => {
      if (err) {
        return e(err);
      }

      // Add files to the test suite
      files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        // Run the mocha test
        mocha.run(function(failures) {
          if (failures > 0) {
            e(new Error(`${failures} tests failed.`));
          } else {
            c();
          }
        });
      } catch (err) {
        console.error(err);
        e(err);
      }
    });
  });
}
