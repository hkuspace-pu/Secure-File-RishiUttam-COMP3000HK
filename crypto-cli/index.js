#!/usr/bin/env node #ignored in windows

import { program } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";``
import ora from "ora";
import figlet from "figlet";

console.log(
  chalk.yellow(figlet.textSync("Client Side Encrypt CLI", { horizontalLayout: "full" }))
);
program
  .version("1.0.0")
  .description("My Node CLI")
  .option("-n, --name <type>", "Add your name")
  .action((options) => {
    console.log(`Hey, ${options.name}!`);
    console.log(chalk.blue(`Hey, ${options.name}!`));
    console.log(chalk.green(`Hey, ${options.name}!`));
    console.log(chalk.red(`Hey, ${options.name}!`));

    inquirer
    .prompt([
      {
        type: "input",
        name: "name",
        message: "What's your name?",
      },
    ])
    .then((answers) => {
      const spinner = ora(`Doing ...`).start(); // Start the spinner
      setTimeout(() => {
        spinner.succeed(chalk.green("Done!"));
        console.log(chalk.green(`Hey there, ${answers.name}!`));
      }, 3000);
      

    });
  });

  program.parse(process.argv);



