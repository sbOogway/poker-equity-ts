#!/usr/bin/env node
import { Command } from "commander";
import { texasHoldEmOdds } from "./texasHoldEmOdds";

const program = new Command();

program
  .name("Poker Equity CLI")
  .description("A powerful CLI tool to calculate poker equities in typescript")
  .version("1.0.0")
  .option('-h, --hands <hands>', 'Specify hands')
  .option('-b, --board <board>', 'Specify board cards', "")
  .parse(process.argv);

const options = program.opts();


const hands = options.hands;
const board = options.board;

console.log(texasHoldEmOdds(hands, board));