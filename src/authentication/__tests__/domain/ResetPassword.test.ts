import { Clock, FixedClock } from "shared/time";
import { Accounts } from "../../domain/Accounts";
import { PasswordHasher } from "../../domain/PasswordHasher";
import { ResetPassword } from "../../usecase/ResetPassword";
import { AccountsInMemory } from "./fakes/AccountsInMemory";
import { FakePasswordHasher } from "./fakes/FakePasswordHasher";
import { anAccountForgotPassword, aVerifiedAccount } from "./builders/Account";
import { CollectEvents } from "../../../shared/events/CollectEvents";
import { PasswordChanged } from "../../domain/event/PasswordChanged";

let resetPassword: ResetPassword;
let passwordHasher: PasswordHasher;
let clock: Clock;
let accounts: Accounts;
let events: CollectEvents;

beforeEach(() => {
  accounts = new AccountsInMemory();
  passwordHasher = new FakePasswordHasher();
  clock = new FixedClock(new Date(new Date("2022-05-22T12:00:00.000Z")));
  events = new CollectEvents();
  resetPassword = new ResetPassword(accounts, passwordHasher, clock, events);
});

it("throws an error when the token is invalid", async () => {
  // Arrange
  const theEmail = "jane.doe@example.com";
  const theToken = "invalid-token";
  const theNewPassword = "the-new-password";
  const theAccount = anAccountForgotPassword()
    .forEmail(theEmail)
    .withPasswordResetToken("the-token")
    .withPasswordResetExpiration(new Date("2022-05-29T12:00:00.000Z"))
    .build();
  await accounts.save(theAccount);

  // Act
  const result = resetPassword.execute(theEmail, theToken, theNewPassword);

  // Assert
  await expect(result).rejects.toEqual(
    new Error("Invalid password reset token invalid-token")
  );
});

it("throws an error when the token is expired", async () => {
  // Arrange
  const theEmail = "jane.doe@example.com";
  const theToken = "the-token";
  const theNewPassword = "the-new-password";
  const theAccount = anAccountForgotPassword()
    .forEmail(theEmail)
    .withPasswordResetToken("the-token")
    .withPasswordResetExpiration(new Date("2022-05-22T11:59:00.000Z"))
    .build();
  await accounts.save(theAccount);

  // Act
  const result = resetPassword.execute(theEmail, theToken, theNewPassword);

  // Assert
  await expect(result).rejects.toEqual(
    new Error("Password reset token the-token is expired")
  );
});

it("resets the password when the token and expiration date are OK", async () => {
  // Arrange
  const theEmail = "jane.doe@example.com";
  const theToken = "some-valid-token";
  const theNewPassword = "the-new-password";
  const theAccount = anAccountForgotPassword()
    .forEmail(theEmail)
    .withPasswordResetToken(theToken)
    .withPasswordResetExpiration(new Date("2022-05-29T12:00:00.000Z"))
    .build();
  await accounts.save(theAccount);

  // Act
  await resetPassword.execute("JANE.DOE@EXAMPLE.COM", theToken, theNewPassword);

  // Assert
  expect(await accounts.verifiedAccountOfEmail(theEmail)).toEqual(
    aVerifiedAccount().forEmail(theEmail).usingPassword(theNewPassword).build()
  );
  expect(events.collected()).toEqual([
    new PasswordChanged("jane.doe@example.com", clock.now()),
  ]);
});
