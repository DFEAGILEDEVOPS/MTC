# Sample usage
# .\CreateReleaseAnnotation.ps1 -apiUrl "https://aigs1.aisvc.visualstudio.com" -applicationId "<appId>" -apiKey "<apiKey>" -releaseName "<releaseName>" -buildNumber "<buildNumber>" -eventDateTime "optional | YYYY-MM-DDTHH:mm:ss"
param(
    [parameter(Mandatory = $true)][string]$apiUrl,
    [parameter(Mandatory = $true)][string]$applicationId,
    [parameter(Mandatory = $true)][string]$apiKey,
    [parameter(Mandatory = $true)][string]$releaseName,
    [parameter(Mandatory = $true)]$buildNumber,
    [parameter(Mandatory = $false)][DateTime]$eventDateTime
)

function CreateAnnotation()
{
	$retries = 1
	$success = $false
	while (!$success -and $retries -lt 6) {
	    $location = "$apiUrl/applications/$applicationId/Annotations?api-version=2015-11"

		Write-Host "Invoke a web request for $location to create a new release annotation. Attempting $retries"
		set-variable -Name createResultStatus -Force -Scope Local -Value $null
		set-variable -Name createResultStatusDescription -Force -Scope Local -Value $null
		set-variable -Name result -Force -Scope Local

		try {
			$result = Invoke-WebRequest -Uri $location -Method Put -Body $bodyJson -Headers $headers -ContentType "application/json; charset=utf-8" -UseBasicParsing
		} catch {
		    if ($_.Exception){
		        if($_.Exception.Response) {
    				$createResultStatus = $_.Exception.Response.StatusCode.value__
    				$createResultStatusDescription = $_.Exception.Response.StatusDescription
    			}
    			else {
    				$createResultStatus = "Exception"
    				$createResultStatusDescription = $_.Exception.Message
    			}
		    }
		}

		if ($result -eq $null) {
			if ($createResultStatus -eq $null) {
				$createResultStatus = "Unknown"
			}
			if ($createResultStatusDescription -eq $null) {
				$createResultStatusDescription = "Unknown"
			}
		}
 		else {
			    $success = $true
        }

		if ($createResultStatus -eq 409 -or $createResultStatus -eq 404 -or $createResultStatus -eq 401) # no retry when conflict or unauthorized or not found
		{
			break
		}

		$retries = $retries + 1
		sleep 1
	}

	$createResultStatus
	$createResultStatusDescription
	return
}

# Need powershell version 3 or greater for script to run
$minimumPowershellMajorVersion = 3
if ($PSVersionTable.PSVersion.Major -lt $minimumPowershellMajorVersion) {
   Write-Host "Need powershell version $minimumPowershellMajorVersion or greater to create release annotation"
   return
}

$currentTime = (Get-Date).ToUniversalTime()
$annotationDate = $currentTime.ToString("MMddyyyy_HHmmss")
set-variable -Name requestBody -Force -Scope Script
$requestBody = @{}
$requestBody.Id = [GUID]::NewGuid()
$requestBody.AnnotationName = $releaseName
if ($eventDateTime -eq $null) {
    $requestBody.EventTime = $currentTime.GetDateTimeFormats("s")[0] # GetDateTimeFormats returns an array
} else {
    # input must be between NOW and 90 days back maximum
    $maxDaysBack = $currentTime.AddDays(-90)
    if ($eventDateTime -lt $maxDaysBack -Or $eventDateTime -gt $currentTime) {
        $output = "-eventDateTime value must be between NOW and 90 days back maximum"
        throw $output
    }

    $requestBody.EventTime = $eventDateTime.GetDateTimeFormats("s")[0]
}
$requestBody.Category = "Deployment"

$properties = @{}
$properties.Add("ReleaseName", $releaseName)
$properties.Add("BuildNumber", $buildNumber)
$requestBody.Properties = ConvertTo-Json($properties) -Compress
$bodyJson = [System.Text.Encoding]::UTF8.GetBytes(($requestBody | ConvertTo-Json))
$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("X-AIAPIKEY", $apiKey)

set-variable -Name createAnnotationResult1 -Force -Scope Local -Value $null
set-variable -Name createAnnotationResultDescription -Force -Scope Local -Value ""

$createAnnotationResult1, $createAnnotationResultDescription = CreateAnnotation
if ($createAnnotationResult1)
{
     $output = "Failed to create an annotation with Id: {0}. Error {1}, Description: {2}." -f $requestBody.Id, $createAnnotationResult1, $createAnnotationResultDescription
	 throw $output
}

$str = "Release annotation created. Id: {0}." -f $requestBody.Id
Write-Host $str
