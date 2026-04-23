import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const SafeText = ({ children, style }: { children: any; style?: any }) => (
  <Text style={style}>
    {children === null || children === undefined ? "" : String(children)}
  </Text>
);

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontSize: 10,
    lineHeight: 1.5,
  },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  bullet: { fontSize: 9, marginBottom: 2 },
});

export const ResumePDF = ({
  data,
  templateId,
}: {
  data: any;
  templateId?: string;
}) => {
  const template = templateId || "classic";
  console.log(template);

  if (template === "classic") {
    return (
      <Document>
        <Page
          size="A4"
          style={{
            ...styles.page,
            fontFamily: "Times-Roman",
            color: "#111827",
          }}
        >
          <View
            style={{
              textAlign: "center",
              marginBottom: 20,
              borderBottomWidth: 2,
              borderBottomColor: "#000000",
              paddingBottom: 12,
            }}
          >
            <SafeText
              style={{ fontSize: 24, fontWeight: "bold", marginBottom: 4 }}
            >
              {data.personalInfo?.fullName}
            </SafeText>
            <SafeText style={{ fontSize: 9, color: "#4B5563" }}>
              {[
                data.personalInfo?.email,
                data.personalInfo?.phone,
                data.personalInfo?.location,
              ]
                .filter(Boolean)
                .join(" • ")}
            </SafeText>
          </View>

          {data.summary && (
            <View style={styles.section}>
              <SafeText
                style={{
                  ...styles.sectionTitle,
                  borderBottomWidth: 1,
                  borderBottomColor: "#D1D5DB",
                  paddingBottom: 3,
                }}
              >
                Summary
              </SafeText>
              <SafeText style={{ fontSize: 9 }}>{data.summary}</SafeText>
            </View>
          )}

          {data.skills?.technical?.length > 0 && (
            <View style={styles.section}>
              <SafeText
                style={{
                  ...styles.sectionTitle,
                  borderBottomWidth: 1,
                  borderBottomColor: "#D1D5DB",
                  paddingBottom: 3,
                }}
              >
                Skills
              </SafeText>
              <SafeText style={{ fontSize: 9 }}>
                {data.skills.technical.join(" • ")}
              </SafeText>
            </View>
          )}

          {data.experience?.length > 0 && (
            <View style={styles.section}>
              <SafeText
                style={{
                  ...styles.sectionTitle,
                  borderBottomWidth: 1,
                  borderBottomColor: "#D1D5DB",
                  paddingBottom: 3,
                }}
              >
                Experience
              </SafeText>
              {data.experience.map((job: any, i: number) => (
                <View key={i} style={{ marginBottom: 10 }}>
                  <View style={styles.row}>
                    <SafeText style={{ fontWeight: "bold" }}>
                      {job.role}
                    </SafeText>
                    <SafeText style={{ fontSize: 9 }}>
                      {job.startDate} – {job.current ? "Present" : job.endDate}
                    </SafeText>
                  </View>
                  <SafeText
                    style={{
                      fontSize: 9,
                      color: "#4B5563",
                      fontStyle: "italic",
                    }}
                  >
                    {job.company}
                    {job.location && `, ${job.location}`}
                  </SafeText>
                  <SafeText style={{ fontSize: 9, marginTop: 2 }}>
                    {job.description}
                  </SafeText>
                </View>
              ))}
            </View>
          )}

          {data.education?.length > 0 && (
            <View style={styles.section}>
              <SafeText
                style={{
                  ...styles.sectionTitle,
                  borderBottomWidth: 1,
                  borderBottomColor: "#D1D5DB",
                  paddingBottom: 3,
                }}
              >
                Education
              </SafeText>
              {data.education.map((edu: any, i: number) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <View style={styles.row}>
                    <SafeText style={{ fontWeight: "bold" }}>
                      {edu.degree}
                    </SafeText>
                    <SafeText style={{ fontSize: 9 }}>
                      {edu.startDate} – {edu.current ? "Present" : edu.endDate}
                    </SafeText>
                  </View>
                  <SafeText style={{ fontSize: 9 }}>
                    {edu.school}
                    {edu.location && `, ${edu.location}`}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </SafeText>
                </View>
              ))}
            </View>
          )}

          {data.certifications?.length > 0 && (
            <View style={styles.section}>
              <SafeText
                style={{
                  ...styles.sectionTitle,
                  borderBottomWidth: 1,
                  borderBottomColor: "#D1D5DB",
                  paddingBottom: 3,
                }}
              >
                Certifications
              </SafeText>
              {data.certifications.map((cert: any, i: number) => (
                <SafeText key={i} style={styles.bullet}>
                  • {cert.name} {cert.issuer && `- ${cert.issuer}`}
                </SafeText>
              ))}
            </View>
          )}
        </Page>
      </Document>
    );
  }

  if (template === "modern") {
    return (
      <Document>
        <Page
          size="A4"
          style={{ ...styles.page, fontFamily: "Helvetica", color: "#111827" }}
        >
          <View
            style={{
              backgroundColor: "#2563eb",
              padding: 24,
              marginBottom: 24,
            }}
          >
            <SafeText
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "#ffffff",
                marginBottom: 4,
              }}
            >
              {data.personalInfo?.fullName}
            </SafeText>
            <SafeText style={{ fontSize: 9, color: "#e5e7eb" }}>
              {[data.personalInfo?.email, data.personalInfo?.phone]
                .filter(Boolean)
                .join(" • ")}
            </SafeText>
          </View>

          {data.summary && (
            <View style={styles.section}>
              <SafeText style={{ ...styles.sectionTitle, color: "#2563eb" }}>
                Profile
              </SafeText>
              <SafeText style={{ fontSize: 9, color: "#374151" }}>
                {data.summary}
              </SafeText>
            </View>
          )}

          {data.experience?.length > 0 && (
            <View style={styles.section}>
              <SafeText style={{ ...styles.sectionTitle, color: "#2563eb" }}>
                Experience
              </SafeText>
              {data.experience.map((job: any, i: number) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <SafeText style={{ fontWeight: "bold", fontSize: 11 }}>
                    {job.role}
                  </SafeText>
                  <SafeText
                    style={{ fontSize: 8, color: "#6B7280", marginBottom: 2 }}
                  >
                    {job.company} • {job.startDate} –{" "}
                    {job.current ? "Present" : job.endDate}
                  </SafeText>
                  <SafeText style={{ fontSize: 9, color: "#374151" }}>
                    {job.description}
                  </SafeText>
                </View>
              ))}
            </View>
          )}

          {data.skills?.technical?.length > 0 && (
            <View style={styles.section}>
              <SafeText style={{ ...styles.sectionTitle, color: "#2563eb" }}>
                Skills
              </SafeText>
              {data.skills.technical.map((s: string, i: number) => (
                <SafeText key={i} style={{ fontSize: 9, marginBottom: 3 }}>
                  • {s}
                </SafeText>
              ))}
            </View>
          )}

          {data.education?.length > 0 && (
            <View style={styles.section}>
              <SafeText style={{ ...styles.sectionTitle, color: "#2563eb" }}>
                Education
              </SafeText>
              {data.education.map((edu: any, i: number) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <SafeText style={{ fontWeight: "bold" }}>
                    {edu.degree}
                  </SafeText>
                  <SafeText style={{ fontSize: 9, color: "#6B7280" }}>
                    {edu.school} • {edu.startDate} –{" "}
                    {edu.current ? "Present" : edu.endDate}
                  </SafeText>
                </View>
              ))}
            </View>
          )}
        </Page>
      </Document>
    );
  }

  if (template === "minimal") {
    return (
      <Document>
        <Page
          size="A4"
          style={{
            ...styles.page,
            fontFamily: "Helvetica",
            color: "#111827",
            padding: 50,
          }}
        >
          <View style={{ marginBottom: 30 }}>
            <SafeText
              style={{ fontSize: 28, fontWeight: "normal", marginBottom: 6 }}
            >
              {data.personalInfo?.fullName}
            </SafeText>
            <SafeText style={{ fontSize: 9, color: "#6B7280" }}>
              {[data.personalInfo?.email, data.personalInfo?.phone]
                .filter(Boolean)
                .join(" · ")}
            </SafeText>
          </View>

          {data.summary && (
            <View style={{ marginBottom: 24 }}>
              <SafeText
                style={{ fontSize: 10, lineHeight: 1.6, color: "#374151" }}
              >
                {data.summary}
              </SafeText>
            </View>
          )}

          {data.skills?.technical?.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <SafeText style={{ ...styles.sectionTitle, marginBottom: 6 }}>
                Skills
              </SafeText>
              <SafeText style={{ fontSize: 9, color: "#4B5563" }}>
                {data.skills.technical.join(" · ")}
              </SafeText>
            </View>
          )}

          {data.experience?.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              {data.experience.map((job: any, i: number) => (
                <View key={i} style={{ marginBottom: 16 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 2,
                    }}
                  >
                    <SafeText style={{ fontSize: 10, fontWeight: "normal" }}>
                      {job.role}
                    </SafeText>
                    <SafeText style={{ fontSize: 8, color: "#6B7280" }}>
                      {job.startDate} – {job.current ? "Present" : job.endDate}
                    </SafeText>
                  </View>
                  <SafeText
                    style={{ fontSize: 8, color: "#6B7280", marginBottom: 2 }}
                  >
                    {job.company}
                  </SafeText>
                  <SafeText style={{ fontSize: 9, color: "#374151" }}>
                    {job.description}
                  </SafeText>
                </View>
              ))}
            </View>
          )}

          {data.education?.length > 0 && (
            <View>
              {data.education.map((edu: any, i: number) => (
                <View key={i} style={{ marginBottom: 12 }}>
                  <SafeText style={{ fontSize: 10 }}>{edu.degree}</SafeText>
                  <SafeText style={{ fontSize: 8, color: "#6B7280" }}>
                    {edu.school} · {edu.startDate} –{" "}
                    {edu.current ? "Present" : edu.endDate}
                  </SafeText>
                </View>
              ))}
            </View>
          )}
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page
        size="A4"
        style={{ ...styles.page, fontFamily: "Helvetica", color: "#111827" }}
      >
        <View
          style={{
            marginBottom: 24,
            borderBottomWidth: 2,
            borderBottomColor: "#1e3a8a",
            paddingBottom: 12,
          }}
        >
          <SafeText
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#1e3a8a",
              marginBottom: 4,
            }}
          >
            {data.personalInfo?.fullName}
          </SafeText>
          <SafeText style={{ fontSize: 9, color: "#4B5563" }}>
            {[
              data.personalInfo?.email,
              data.personalInfo?.phone,
              data.personalInfo?.location,
            ]
              .filter(Boolean)
              .join(" • ")}
          </SafeText>
        </View>

        <View style={{ flexDirection: "row" }}>
          <View style={{ width: "30%", paddingRight: 16 }}>
            {data.skills?.technical?.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <SafeText
                  style={{
                    ...styles.sectionTitle,
                    color: "#1e3a8a",
                    marginBottom: 6,
                  }}
                >
                  Technical
                </SafeText>
                {data.skills.technical.map((s: string, i: number) => (
                  <SafeText key={i} style={{ fontSize: 9, marginBottom: 3 }}>
                    • {s}
                  </SafeText>
                ))}
              </View>
            )}
            {data.skills?.soft?.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <SafeText
                  style={{
                    ...styles.sectionTitle,
                    color: "#1e3a8a",
                    marginBottom: 6,
                  }}
                >
                  Soft Skills
                </SafeText>
                {data.skills.soft.map((s: string, i: number) => (
                  <SafeText key={i} style={{ fontSize: 9, marginBottom: 3 }}>
                    • {s}
                  </SafeText>
                ))}
              </View>
            )}
          </View>

          <View style={{ width: "70%" }}>
            {data.summary && (
              <View style={styles.section}>
                <SafeText style={{ ...styles.sectionTitle, color: "#1e3a8a" }}>
                  Summary
                </SafeText>
                <SafeText style={{ fontSize: 9, lineHeight: 1.5 }}>
                  {data.summary}
                </SafeText>
              </View>
            )}

            {data.experience?.length > 0 && (
              <View style={styles.section}>
                <SafeText style={{ ...styles.sectionTitle, color: "#1e3a8a" }}>
                  Experience
                </SafeText>
                {data.experience.map((job: any, i: number) => (
                  <View
                    key={i}
                    style={{
                      marginBottom: 12,
                      paddingLeft: 8,
                      borderLeftWidth: 2,
                      borderLeftColor: "#d1d5db",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 2,
                      }}
                    >
                      <SafeText style={{ fontWeight: "bold" }}>
                        {job.role}
                      </SafeText>
                      <SafeText style={{ fontSize: 8, color: "#1e3a8a" }}>
                        {job.startDate} –{" "}
                        {job.current ? "Present" : job.endDate}
                      </SafeText>
                    </View>
                    <SafeText
                      style={{
                        fontSize: 9,
                        fontWeight: "bold",
                        marginBottom: 2,
                      }}
                    >
                      {job.company}
                      {job.location && ` • ${job.location}`}
                    </SafeText>
                    <SafeText style={{ fontSize: 9 }}>
                      {job.description}
                    </SafeText>
                  </View>
                ))}
              </View>
            )}

            {data.education?.length > 0 && (
              <View style={styles.section}>
                <SafeText style={{ ...styles.sectionTitle, color: "#1e3a8a" }}>
                  Education
                </SafeText>
                {data.education.map((edu: any, i: number) => (
                  <View key={i} style={{ marginBottom: 8 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 2,
                      }}
                    >
                      <SafeText style={{ fontWeight: "bold" }}>
                        {edu.degree}
                      </SafeText>
                      <SafeText style={{ fontSize: 8, color: "#1e3a8a" }}>
                        {edu.startDate} –{" "}
                        {edu.current ? "Present" : edu.endDate}
                      </SafeText>
                    </View>
                    <SafeText style={{ fontSize: 9 }}>
                      {edu.school}
                      {edu.location && ` • ${edu.location}`}
                    </SafeText>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};
