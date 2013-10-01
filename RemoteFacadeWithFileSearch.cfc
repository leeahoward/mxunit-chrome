<cfcomponent name="mxunitchrome.RemoteFacadeWithFileSearch" extends="mxunit.framework.RemoteFacade"  hint="" wsversion="1">

  <cffunction name="getDirectory" access="remote" returntype="struct">
    <cfargument name="directoryName" required="true" type="string" hint="">
    <cfset var directory="">
    <cfset var md = getMetaData( this ) />
    <cfset var file = [] />
    <cfset var filemd = [] />
    <cfset var filepath = ""/>
    <cfset var filemdtmp= ""/>
    <!--- prevent browsing to parent directories.  Just remove any .s from the path --->
    <cfset var arguments.directoryName = replace(arguments.directoryName,".","","all")> 
    <!--- directory to use in the component path --->
    <cfset var dotdirectory=replace(replace( arguments.directoryname, "/" , "." , "all" ),".","","one") & "." />
    <!--- 
    get the path of this component and append the path of the requested directory
    clean up the path and use only \ for directory seperators 
    --->
    <cfset var directory=replace(
      replace(
        getDirectoryFromPath(md.path) & 
        replace(arguments.directoryname,"./","","all"),
        "\/","/","all")
      ,"/","\","all") >

    <!--- 
      get all cfc files in the directory.   
    --->
    <cfdirectory listinfo="name" 
      directory="#directory#" 
      recurse = "NO" 
      name="files" 
      filter="*.cfc">
    <!--- 
      get all directories in this directory.   
    --->
    <cfdirectory listinfo="name" 
      directory="#directory#" 
      recurse="NO" 
      name="directories" 
      type="dir">
    <!--- 
      filter out hidden folders.   
    --->
    <cfquery dbtype="query" name="directories">
      select * from directories where name NOT in ('.svn','.git') AND name NOT like '.%'
    </cfquery>

    <!--- 
      get only files that extend msunit.framework.TestCase 
    --->
    <cfloop query="files">
      <cftry>
        <cfset filepath = dotdirectory & replace(name,".cfc","") />
        <cfset filemdtmp = getComponentMetadata( filepath ) />
        <cfif filemdtmp.extends.name EQ "mxunit.framework.TestCase">
          <!--- 
            get the runnable methods from this component
          --->
          <cfset filemdtmp.runnablemethods = this.getComponentMethods( filepath ) />
          <cfset arrayAppend( filemd, filemdtmp ) />
        </cfif>

        <cfcatch>
            <!--- 
              Save and send errors
            --->
            <cfset arrayAppend( filemd, {message=cfcatch.message,filepath=filepath }) />
        </cfcatch>
      </cftry>
    </cfloop>

    <cfreturn {
      files = querytoArrayOfStructs(files),
      directories=queryToArrayOfStructs(directories),
      query=directoryname,
      metadata=md,
      directory=directory,
      filemd=filemd
    } >
  </cffunction>


  <cffunction name="queryToArrayOfStructs" access="private" output="false" returnType="array">
    <cfargument name="query" required="true">
    <cfset var ret = arrayNew(1) />
    <cfloop query="arguments.query">
      <cfset arrayAppend(ret,queryRowToStruct(arguments.query,arguments.query.currentrow)) />
    </cfloop>
    <cfreturn ret />
  </cffunction>

  <cffunction name="queryRowToStruct" output="false" returnType="struct" access="private">
    <cfargument name="query" required="yes">
    <cfargument name="row" required="no" default="1">
    <!--- a var for looping --->
    <cfset var ii = 1 />
    <!--- the cols to loop over --->
    <cfset var cols = listToArray(query.columnList) />
    <!--- the struct to return --->
    <cfset var stReturn = structnew() />
    <!--- loop over the cols and build the struct from the query row --->
    <cfloop from="1" to="#arraylen(cols)#" index="ii">
      <cfset stReturn[cols[ii]] = query[cols[ii]][arguments.row] />
    </cfloop>
    <cfreturn stReturn />
  </cffunction>

</cfcomponent>