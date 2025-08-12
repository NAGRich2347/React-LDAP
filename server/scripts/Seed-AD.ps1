param(
  [string]$DomainDN = "DC=yourdomain,DC=com",
  [string]$UsersOU = "OU=Users",
  [string]$GroupsOU = "OU=Groups",
  [string]$DefaultPassword = "P@ssw0rd!"
)

function Ensure-OU {
  param([string]$OU, [string]$DN)
  $ouPath = "OU=$OU,$DN"
  if (-not (Get-ADOrganizationalUnit -LDAPFilter "(ou=$OU)" -SearchBase $DN -ErrorAction SilentlyContinue)) {
    New-ADOrganizationalUnit -Name $OU -Path $DN -ProtectedFromAccidentalDeletion $false | Out-Null
  }
  return $ouPath
}

function Ensure-Group {
  param([string]$Name, [string]$Path)
  if (-not (Get-ADGroup -LDAPFilter "(cn=$Name)" -SearchBase $Path -ErrorAction SilentlyContinue)) {
    New-ADGroup -Name $Name -GroupScope Global -Path $Path | Out-Null
  }
}

function Ensure-User {
  param([string]$Sam, [string]$OUPath, [string]$Password)
  if (-not (Get-ADUser -LDAPFilter "(sAMAccountName=$Sam)" -SearchBase $OUPath -ErrorAction SilentlyContinue)) {
    New-ADUser -Name $Sam -SamAccountName $Sam -UserPrincipalName "$Sam@$(($DomainDN -replace 'DC=','' -replace ',','.' ))" -Enabled $true -Path $OUPath -AccountPassword (ConvertTo-SecureString $Password -AsPlainText -Force) | Out-Null
  }
}

Import-Module ActiveDirectory

$usersOUPath = Ensure-OU -OU ($UsersOU -replace '^OU=','') -DN $DomainDN
$groupsOUPath = Ensure-OU -OU ($GroupsOU -replace '^OU=','') -DN $DomainDN

# Groups
$groupNames = @('Students','Librarians','Reviewers','Admins')
foreach ($g in $groupNames) { Ensure-Group -Name $g -Path $groupsOUPath }

# Users
$students = 'john.smith','sarah.jones','michael.brown','emily.davis','david.wilson'
$librarians = 'dr.martinez','prof.thompson','ms.chen'
$reviewers = 'dr.anderson','prof.garcia','dr.kumar'
$admins = 'admin.rodriguez','admin.patel'

foreach ($u in $students) { Ensure-User -Sam $u -OUPath $usersOUPath -Password $DefaultPassword; Add-ADGroupMember -Identity "CN=Students,$groupsOUPath" -Members $u -ErrorAction SilentlyContinue }
foreach ($u in $librarians) { Ensure-User -Sam $u -OUPath $usersOUPath -Password $DefaultPassword; Add-ADGroupMember -Identity "CN=Librarians,$groupsOUPath" -Members $u -ErrorAction SilentlyContinue }
foreach ($u in $reviewers) { Ensure-User -Sam $u -OUPath $usersOUPath -Password $DefaultPassword; Add-ADGroupMember -Identity "CN=Reviewers,$groupsOUPath" -Members $u -ErrorAction SilentlyContinue }
foreach ($u in $admins) { Ensure-User -Sam $u -OUPath $usersOUPath -Password $DefaultPassword; Add-ADGroupMember -Identity "CN=Admins,$groupsOUPath" -Members $u -ErrorAction SilentlyContinue }

Write-Host "Active Directory seeding complete." -ForegroundColor Green


