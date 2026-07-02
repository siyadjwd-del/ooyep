/* ------------------------------------------------------------
   exec_charm_v2.sql
   Purpose : Run the charm_v2 stored procedure for an as-at date,
             optionally restricted to a single account.
   Inputs  : @AsAtDate (required), @AccountCode (NULL = all accounts)
   Output  : Whatever charm_v2 returns.
   Note    : Two-part name assumes a schema called rptx. If rptx is
             the database, change to rptx.dbo.charm_v2 (see CLAUDE.md).
   ------------------------------------------------------------ */

DECLARE @AsAtDate    date        = '2026-06-30';
DECLARE @AccountCode varchar(20) = NULL;   -- set to run a single account

EXEC rptx.charm_v2 @AsAtDate = @AsAtDate;

-- single account version:
-- EXEC rptx.charm_v2 @AsAtDate = @AsAtDate, @AccountCode = @AccountCode;
