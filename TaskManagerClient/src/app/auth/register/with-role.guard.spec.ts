import { TestBed } from '@angular/core/testing';

import { WithRoleGuard } from './with-role.guard';

describe('WithRoleGuard', () => {
  let guard: WithRoleGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(WithRoleGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
