import React, { useState } from "react";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { Card, CardHeader, CardBody, CardFooter } from "./Card";
import { Panel, PanelHeader, PanelBody, PanelFooter } from "./Panel";
import { Separator } from "./Separator";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Badge } from "./Badge";
import { Toggle } from "./Toggle";
import { Checkbox } from "./Checkbox";
import { Select } from "./Select";
import { Spinner } from "./Spinner";
import { Skeleton } from "./Skeleton";
import { COLORS } from "../CONSTANTS/colors";
import { TYPOGRAPHY } from "../CONSTANTS/typography";
import { Search, Send, Trash2, Mail, Info } from "lucide-react";

export const ComponentLab: React.FC = () => {
  const [toggleVal, setToggleVal] = useState(true);
  const [checkboxVal, setCheckboxVal] = useState(true);
  const [selectVal, setSelectVal] = useState("arduino");

  return (
    <div style={{ padding: "40px", backgroundColor: COLORS.GRAPHITE_900, minHeight: "100vh", fontFamily: TYPOGRAPHY.UI }}>
      <h1 style={{ color: COLORS.WARM_WHITE, marginBottom: "32px", fontSize: "32px" }}>40Labs Component Lab</h1>

      {/* Buttons */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ color: COLORS.FOG, marginBottom: "16px", borderBottom: `1px solid ${COLORS.GRAPHITE_500}`, paddingBottom: "8px" }}>Buttons</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="neutral">Neutral</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" isLoading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="lg">Large</Button>
          <Button variant="primary" leftIcon={<Send size={16} />}>With Icon</Button>
        </div>
      </section>

      {/* Icon Buttons */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ color: COLORS.FOG, marginBottom: "16px", borderBottom: `1px solid ${COLORS.GRAPHITE_500}`, paddingBottom: "8px" }}>Icon Buttons</h2>
        <div style={{ display: "flex", gap: "16px" }}>
          <IconButton icon={<Trash2 size={20} />} variant="danger" />
          <IconButton icon={<Search size={20} />} variant="neutral" />
          <IconButton icon={<Mail size={20} />} variant="primary" />
          <IconButton icon={<Info size={16} />} variant="ghost" size="sm" />
        </div>
      </section>

      {/* Badges */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ color: COLORS.FOG, marginBottom: "16px", borderBottom: `1px solid ${COLORS.GRAPHITE_500}`, paddingBottom: "8px" }}>Badges</h2>
        <div style={{ display: "flex", gap: "12px" }}>
          <Badge variant="neutral">Neutral</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </section>

      {/* Inputs */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ color: COLORS.FOG, marginBottom: "16px", borderBottom: `1px solid ${COLORS.GRAPHITE_500}`, paddingBottom: "8px" }}>Inputs & Controls</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", maxWidth: "800px" }}>
          <Input label="Email" placeholder="Enter your email" prefix={<Mail size={16} />} />
          <Input label="Password" type="password" error="Invalid password" required />
          <Input label="Username" success defaultValue="40labs_dev" />
          <Input label="Readonly" readOnly defaultValue="CANNOT_EDIT" />
          <Textarea label="Bio" placeholder="Tell us about yourself..." hint="Maximum 200 characters" />
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Select
              label="Select Board"
              value={selectVal}
              onChange={setSelectVal}
              options={[
                { value: "arduino", label: "Arduino Uno" },
                { value: "esp32", label: "ESP32 DevKit" },
                { value: "pico", label: "Raspberry Pi Pico" },
              ]}
            />
            <div style={{ display: "flex", gap: "32px" }}>
              <Toggle label="Notifications" checked={toggleVal} onChange={setToggleVal} />
              <Checkbox label="Remember me" checked={checkboxVal} onChange={setCheckboxVal} />
            </div>
          </div>
        </div>
      </section>

      {/* Cards & Panels */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ color: COLORS.FOG, marginBottom: "16px", borderBottom: `1px solid ${COLORS.GRAPHITE_500}`, paddingBottom: "8px" }}>Cards & Panels</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
          <Card>
            <CardHeader>
              <h3 style={{ margin: 0, fontSize: "16px" }}>Project Settings</h3>
            </CardHeader>
            <CardBody>
              <p style={{ margin: 0, color: COLORS.FOG, fontSize: "14px" }}>
                Adjust your circuit parameters and simulation environment here.
              </p>
              <Separator margin="16px" />
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Skeleton width="60%" height="16px" />
                <Skeleton width="80%" height="16px" />
              </div>
            </CardBody>
            <CardFooter>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <Button variant="ghost" size="sm">Cancel</Button>
                <Button variant="primary" size="sm">Save</Button>
              </div>
            </CardFooter>
          </Card>

          <Panel>
            <PanelHeader>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: COLORS.TRACE_GREEN }} />
                <h3 style={{ margin: 0, fontSize: "16px" }}>Terminal</h3>
              </div>
            </PanelHeader>
            <PanelBody style={{ backgroundColor: COLORS.GRAPHITE_900, height: "150px", overflow: "hidden" }}>
              <code style={{ color: COLORS.TRACE_GREEN, fontSize: "12px", fontFamily: TYPOGRAPHY.CODE }}>
                {`> Initializing compiler...\n> Sketch size: 1024 bytes\n> Uploading to board... OK`}
              </code>
            </PanelBody>
          </Panel>
        </div>
      </section>

      {/* Misc */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ color: COLORS.FOG, marginBottom: "16px", borderBottom: `1px solid ${COLORS.GRAPHITE_500}`, paddingBottom: "8px" }}>Misc</h2>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
             <Spinner size="sm" />
             <Spinner size="md" />
             <Spinner size="lg" />
          </div>
          <div style={{ height: "40px", display: "flex" }}>
            <Separator orientation="vertical" margin="20px" />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
             <Skeleton variant="circular" width={40} height={40} />
             <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <Skeleton width={120} height={12} variant="text" />
                <Skeleton width={80} height={10} variant="text" />
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};
